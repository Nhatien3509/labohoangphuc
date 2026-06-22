package com.gtsc.dmst.flink.file;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gtsc.dmst.flink.OtelLogger;
import org.apache.flink.api.common.state.MapState;
import org.apache.flink.api.common.state.MapStateDescriptor;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.streaming.api.functions.KeyedProcessFunction;
import org.apache.flink.util.Collector;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.errors.TopicExistsException;
import org.apache.kafka.common.serialization.StringSerializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.atomic.AtomicLong;

public class FileDownloadFunction extends KeyedProcessFunction<String, String, Void> {
    private static final Logger LOG = LoggerFactory.getLogger(FileDownloadFunction.class);
    private static final ObjectMapper mapper = new ObjectMapper();

    private static final String DEFAULT_REQUEST_TOPIC_TEMPLATE = "FILE_DOWNLOAD_REQUEST_{maLoaiDuLieu}";

    private final FileFieldConfig fieldConfig;
    private final String kafkaBrokers;
    private final String metadataId;
    private final String sinkHdfsPath;
    private final AtomicLong recordsFileRequested;
    private final String requestTopicTemplate;
    private final int requestTopicPartitions;
    private final short requestTopicReplicationFactor;
    private final OtelLogger otel;

    private transient MapState<String, String> phienBanByFileId;
    private transient KafkaProducer<String, String> producer;
    private transient AdminClient adminClient;
    private transient Set<String> ensuredTopics;

    public FileDownloadFunction(FileFieldConfig fieldConfig, String kafkaBrokers,
                                String metadataId, String sinkHdfsPath, AtomicLong recordsFileRequested,
                                int requestTopicPartitions, short requestTopicReplicationFactor,
                                OtelLogger otel) {
        this.fieldConfig                   = fieldConfig;
        this.kafkaBrokers                  = kafkaBrokers;
        this.metadataId                    = metadataId;
        this.sinkHdfsPath                  = sinkHdfsPath;
        this.recordsFileRequested          = recordsFileRequested;
        this.requestTopicTemplate          = resolveRequestTopicTemplate(fieldConfig);
        this.requestTopicPartitions        = requestTopicPartitions;
        this.requestTopicReplicationFactor = requestTopicReplicationFactor;
        this.otel                          = otel;
    }

    @Override
    public void open(Configuration parameters) throws Exception {
        MapStateDescriptor<String, String> desc = new MapStateDescriptor<>(
                "phienBanByFileId", String.class, String.class);
        phienBanByFileId = getRuntimeContext().getMapState(desc);

        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaBrokers);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.ACKS_CONFIG, "all");
        props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        props.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 1);
        producer = new KafkaProducer<>(props);
        adminClient = AdminClient.create(props);
        ensuredTopics = ConcurrentHashMap.newKeySet();
        LOG.info("FileDownloadFunction opened, topicTemplate={} metadataId={} partitions={} replicationFactor={}",
                requestTopicTemplate, metadataId, requestTopicPartitions, requestTopicReplicationFactor);
    }

    @Override
    public void processElement(String record, Context ctx, Collector<Void> out) throws Exception {
        Map<String, Object> root = mapper.readValue(record, Map.class);
        List<Map<String, Object>> fileItems = extractFileItems(record);
        if (fileItems.isEmpty()) {
            return;
        }

        for (Map<String, Object> item : fileItems) {
            String fileId       = getStr(item, root, fieldConfig.getFileIdField());
            String phienBan     = getStr(item, root, fieldConfig.getPhienBanField());
            String maLoaiDuLieu = getStr(item, root, fieldConfig.getMaLoaiDuLieuField());

            if (fileId == null || fileId.isEmpty()) {
                continue;
            }

            String lastPhienBan = phienBanByFileId.get(fileId);
            if (phienBan != null && phienBan.equals(lastPhienBan)) {
                LOG.debug("Skip duplicate: fileId={} phienBan={}", fileId, phienBan);
                if (otel != null) otel.fileDownloadSkipped(fileId, phienBan);
                continue;
            }

            FileDownloadRequest req = new FileDownloadRequest(
                    metadataId,
                    sinkHdfsPath,
                    getStr(item, root, fieldConfig.getItemIdField()),
                    fileId,
                    getStr(item, root, fieldConfig.getTenTepField()),
                    maLoaiDuLieu,
                    phienBan,
                    getStr(item, root, fieldConfig.getCheckSumField()),
                    getStr(item, root, fieldConfig.getDuongDanField()),
                    Instant.now().toString()
            );

            String payload = mapper.writeValueAsString(req);
            String requestTopic = resolveRequestTopic(root, item, maLoaiDuLieu);
            ensureTopicExists(requestTopic);
            try {
                producer.send(new ProducerRecord<>(requestTopic, fileId, payload)).get();
            } catch (Exception sendEx) {
                LOG.error("File download send failed: fileId={} topic={} error={}", fileId, requestTopic, sendEx.getMessage());
                if (otel != null) otel.fileDownloadSendFailed(fileId, requestTopic,
                        sendEx.getMessage() != null ? sendEx.getMessage() : sendEx.getClass().getName());
                continue;
            }
            if (phienBan != null) phienBanByFileId.put(fileId, phienBan);
            recordsFileRequested.incrementAndGet();

            LOG.info("File download requested: topic={} fileId={} phienBan={} metadataId={}",
                    requestTopic, fileId, phienBan, metadataId);
            if (otel != null) otel.fileDownloadRequested(fileId, phienBan, maLoaiDuLieu, requestTopic);
        }
    }

    @Override
    public void close() {
        if (producer != null) {
            producer.flush();
            producer.close();
        }
        if (adminClient != null) {
            adminClient.close();
        }
    }

    private void ensureTopicExists(String topic) throws Exception {
        if (ensuredTopics.contains(topic)) {
            return;
        }
        try {
            NewTopic newTopic = new NewTopic(topic, requestTopicPartitions, requestTopicReplicationFactor);
            adminClient.createTopics(Collections.singleton(newTopic)).all().get();
            LOG.info("File download request topic created: topic={} partitions={} replicationFactor={}",
                    topic, requestTopicPartitions, requestTopicReplicationFactor);
        } catch (ExecutionException e) {
            if (!(e.getCause() instanceof TopicExistsException)) {
                throw e;
            }
            LOG.info("File download request topic already exists: {}", topic);
        }
        ensuredTopics.add(topic);
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> extractFileItems(String record) {
        try {
            String path = fieldConfig.getFileListPath();
            Map<String, Object> root = mapper.readValue(record, Map.class);
            if (path == null || path.isEmpty()) {
                return Collections.singletonList(root);
            }

            Object current = root;
            for (String part : path.split("\\.")) {
                if (!(current instanceof Map)) {
                    current = null;
                    break;
                }
                Map<String, Object> map = (Map<String, Object>) current;
                Object next = map.get(part);
                if (next == null) next = findValueIgnoreCase(map, part);
                current = next;
                if (current == null) break;
            }

            if (current instanceof List) {
                return (List<Map<String, Object>>) current;
            }
            LOG.warn("fileListPath '{}' not found in record", path);
        } catch (Exception e) {
            LOG.error("Failed to extract file items: {}", e.getMessage());
        }
        return Collections.emptyList();
    }

    private String getStr(Map<String, Object> item, Map<String, Object> root, String fieldName) {
        if (fieldName == null || fieldName.isEmpty()) return null;
        Object val = getPathValue(item, fieldName);
        if (val == null && root != null) {
            val = getPathValue(root, fieldName);
        }
        return val != null ? val.toString() : null;
    }

    @SuppressWarnings("unchecked")
    private Object getPathValue(Map<String, Object> source, String path) {
        if (source == null || path == null || path.isEmpty()) return null;
        Object current = source;
        for (String part : path.split("\\.")) {
            if (!(current instanceof Map)) return null;
            Map<String, Object> map = (Map<String, Object>) current;
            current = map.get(part);
            if (current == null) {
                current = findValueIgnoreCase(map, part);
            }
            if (current == null) return null;
        }
        return current;
    }

    private Object findValueIgnoreCase(Map<String, Object> map, String key) {
        String lower = key.toLowerCase();
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            if (entry.getKey().toLowerCase().equals(lower)) {
                return entry.getValue();
            }
        }
        return null;
    }

    private String resolveRequestTopicTemplate(FileFieldConfig config) {
        if (config != null && config.getDownloadRequestTopic() != null
                && !config.getDownloadRequestTopic().trim().isEmpty()) {
            return config.getDownloadRequestTopic().trim();
        }
        return DEFAULT_REQUEST_TOPIC_TEMPLATE;
    }

    private String resolveRequestTopic(Map<String, Object> root, Map<String, Object> item, String maLoaiDuLieu) {
        String topic = requestTopicTemplate
                .replace("{metadataId}", sanitizeTopicPart(metadataId))
                .replace("{maLoaiDuLieu}", sanitizeTopicPart(maLoaiDuLieu));

        if (topic.contains("{")) {
            topic = replaceKnownFieldToken(topic, root, item, "itemId", fieldConfig.getItemIdField());
            topic = replaceKnownFieldToken(topic, root, item, "fileId", fieldConfig.getFileIdField());
            topic = replaceKnownFieldToken(topic, root, item, "phienBan", fieldConfig.getPhienBanField());
        }

        return topic.replaceAll("\\{[^}]+}", "").replaceAll("_+", "_").replaceAll("_$", "");
    }

    private String replaceKnownFieldToken(String topic, Map<String, Object> root, Map<String, Object> item,
                                          String tokenName, String fieldPath) {
        if (!topic.contains("{" + tokenName + "}")) {
            return topic;
        }
        return topic.replace("{" + tokenName + "}", sanitizeTopicPart(getStr(item, root, fieldPath)));
    }

    private String sanitizeTopicPart(String value) {
        if (value == null || value.trim().isEmpty()) {
            return "";
        }
        return value.trim()
                .toUpperCase(Locale.ROOT)
                .replaceAll("[^A-Z0-9_\\-\\.]", "_")
                .replaceAll("_+", "_")
                .replaceAll("^_", "")
                .replaceAll("_$", "");
    }
}
