package com.gtsc.dmst.flink.filter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gtsc.dmst.flink.GenericStreamProcessor.KafkaEnvelope;
import com.gtsc.dmst.flink.OtelLogger;
import org.apache.flink.api.common.state.ValueState;
import org.apache.flink.api.common.state.ValueStateDescriptor;
import org.apache.flink.api.common.typeinfo.Types;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.streaming.api.functions.KeyedProcessFunction;
import org.apache.flink.util.Collector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Dedup record theo trangThaiDuLieu.phienBan (case-insensitive).
 * Key = duLieuTiepNhan.maDinhDanhDuLieu (case-insensitive).
 * Drop nếu phienBan <= phienBan đã thấy trước đó.
 */
public class RecordVersionDedupFunction extends KeyedProcessFunction<String, KafkaEnvelope, KafkaEnvelope> {

    private static final long serialVersionUID = 1L;
    private static final Logger LOG = LoggerFactory.getLogger(RecordVersionDedupFunction.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final OtelLogger otel;

    private transient ValueState<Integer> lastPhienBan;

    public RecordVersionDedupFunction(OtelLogger otel) {
        this.otel = otel;
    }

    @Override
    public void open(Configuration parameters) {
        lastPhienBan = getRuntimeContext().getState(
                new ValueStateDescriptor<>("record-phien-ban", Types.INT));
    }

    @Override
    public void processElement(KafkaEnvelope envelope, Context ctx, Collector<KafkaEnvelope> out) throws Exception {
        String json = envelope.getValue();
        if (json == null) {
            out.collect(envelope);
            return;
        }

        JsonNode root;
        try {
            root = MAPPER.readTree(json);
        } catch (Exception e) {
            out.collect(envelope);
            return;
        }

        Integer phienBan = extractPhienBan(root);
        if (phienBan == null) {
            out.collect(envelope);
            return;
        }

        Integer last = lastPhienBan.value();
        if (last != null && phienBan <= last) {
            String id = extractMaDinhDanh(root);
            LOG.error("Dedup: skip record phienBan={} <= last={} maDinhDanh={} topic={}",
                    phienBan, last, id, envelope.getTopic());
            if (otel != null) otel.error(
                    "[FLINK-ERROR] Record dedup skipped: phienBan=" + phienBan + " <= last=" + last,
                    java.util.Map.of(
                            "maDinhDanh", id != null ? id : "",
                            "phienBan", phienBan,
                            "lastPhienBan", last,
                            "topic", envelope.getTopic()
                    ), null);
            return;
        }

        lastPhienBan.update(phienBan);
        out.collect(envelope);
    }

    private Integer extractPhienBan(JsonNode root) {
        JsonNode trangThai = getNodeIgnoreCase(root, "trangThaiDuLieu");
        if (trangThai == null) return null;
        JsonNode pb = getNodeIgnoreCase(trangThai, "phienBan");
        if (pb == null || !pb.isNumber()) return null;
        return pb.intValue();
    }

    private String extractMaDinhDanh(JsonNode root) {
        JsonNode duLieu = getNodeIgnoreCase(root, "duLieuTiepNhan");
        if (duLieu == null) return null;
        JsonNode id = getNodeIgnoreCase(duLieu, "maDinhDanhDuLieu");
        return id != null ? id.asText() : null;
    }

    private JsonNode getNodeIgnoreCase(JsonNode parent, String fieldName) {
        if (parent == null || !parent.isObject()) return null;
        JsonNode direct = parent.get(fieldName);
        if (direct != null) return direct;
        String lower = fieldName.toLowerCase();
        java.util.Iterator<String> names = parent.fieldNames();
        while (names.hasNext()) {
            String name = names.next();
            if (name.toLowerCase().equals(lower)) return parent.get(name);
        }
        return null;
    }
}
