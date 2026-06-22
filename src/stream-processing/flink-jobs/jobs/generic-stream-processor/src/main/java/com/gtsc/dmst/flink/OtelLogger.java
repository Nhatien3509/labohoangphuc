package com.gtsc.dmst.flink;

import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.api.logs.LogRecordBuilder;
import io.opentelemetry.api.logs.Logger;
import io.opentelemetry.api.logs.Severity;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.logs.SdkLoggerProvider;
import io.opentelemetry.sdk.logs.export.BatchLogRecordProcessor;
import io.opentelemetry.sdk.resources.Resource;
import io.opentelemetry.exporter.otlp.logs.OtlpGrpcLogRecordExporter;

import java.io.Closeable;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.TimeUnit;

public class OtelLogger implements Closeable, java.io.Serializable {

    private static final long serialVersionUID = 1L;

    private static final AttributeKey<String> KEY_SERVICE   = AttributeKey.stringKey("service.name");
    private static final AttributeKey<String> KEY_JOB       = AttributeKey.stringKey("flink.job");
    private static final AttributeKey<String> KEY_EVENT     = AttributeKey.stringKey("event");
    private static final AttributeKey<String> KEY_TOPIC     = AttributeKey.stringKey("kafka.topic");
    private static final AttributeKey<String> KEY_FIELD     = AttributeKey.stringKey("field");
    private static final AttributeKey<String> KEY_REASON    = AttributeKey.stringKey("reason");
    private static final AttributeKey<String> KEY_FILE_ID   = AttributeKey.stringKey("file.id");
    private static final AttributeKey<String> KEY_PHIEN_BAN = AttributeKey.stringKey("file.phienBan");
    private static final AttributeKey<String> KEY_MA_LOAI   = AttributeKey.stringKey("maLoaiDuLieu");
    private static final AttributeKey<Long>   KEY_COUNT     = AttributeKey.longKey("count");
    private static final AttributeKey<String> KEY_ERROR     = AttributeKey.stringKey("error");
    private static final AttributeKey<String> KEY_KEY       = AttributeKey.stringKey("kafka.key");

    private final String endpoint;
    private final String serviceName;
    private final String jobName;

    private transient OpenTelemetrySdk sdk;
    private transient Logger logger;

    public OtelLogger(String endpoint, String serviceName, String jobName) {
        this.endpoint    = endpoint;
        this.serviceName = serviceName;
        this.jobName     = jobName;
        initSdk();
    }

    private void initSdk() {
        Resource resource = Resource.create(Attributes.of(KEY_SERVICE, serviceName));

        OtlpGrpcLogRecordExporter exporter = OtlpGrpcLogRecordExporter.builder()
                .setEndpoint(endpoint)
                .setTimeout(5, TimeUnit.SECONDS)
                .build();

        SdkLoggerProvider loggerProvider = SdkLoggerProvider.builder()
                .setResource(resource)
                .addLogRecordProcessor(BatchLogRecordProcessor.builder(exporter)
                        .setScheduleDelay(2, TimeUnit.SECONDS)
                        .build())
                .build();

        this.sdk    = OpenTelemetrySdk.builder().setLoggerProvider(loggerProvider).build();
        this.logger = loggerProvider.get(OtelLogger.class.getName());
    }

    private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
        in.defaultReadObject();
        initSdk();
    }

    public void info(String event, Map<String, Object> attrs) {
        emit(Severity.INFO, event, attrs, null);
    }

    public void warn(String event, Map<String, Object> attrs) {
        emit(Severity.WARN, event, attrs, null);
    }

    public void error(String event, Map<String, Object> attrs, Throwable ex) {
        emit(Severity.ERROR, event, attrs, ex);
    }

    // ── Convenience methods ───────────────────────────────────────────────────

    public void jobStarted(String metadataName, String topicPattern, String startingOffset) {
        info("[FLINK] Job started: " + metadataName, Map.of(
                "metadata", metadataName,
                "topicPattern", topicPattern,
                "startingOffset", startingOffset
        ));
    }

    public void validationFailed(String topic, String field, String reason) {
        warn("[FLINK-WARN] Validation failed: field=" + field + " topic=" + topic, Map.of(
                "topic", topic,
                "field", field,
                "reason", reason
        ));
    }

    public void transformFailed(String topic, String error) {
        error("[FLINK-ERROR] Transform failed: topic=" + topic, Map.of(
                "topic", topic,
                "error", error
        ), null);
    }

    public void cdpPublished(String topic, String key, long count) {
        info("[FLINK] Publish Kafka CDP: topic=" + topic + " count=" + count, Map.of(
                "topic", topic,
                "key", key != null ? key : "",
                "count", count
        ));
    }

    public void cdpPublishFailed(String topic, String error) {
        error("[FLINK-ERROR] Publish Kafka CDP failed: topic=" + topic, Map.of(
                "topic", topic,
                "error", error
        ), null);
    }

    public void fileDownloadRequested(String fileId, String phienBan, String maLoaiDuLieu, String requestTopic) {
        info("[FLINK] File download requested: fileId=" + fileId + " maLoaiDuLieu=" + maLoaiDuLieu, Map.of(
                "fileId", fileId,
                "phienBan", phienBan != null ? phienBan : "",
                "maLoaiDuLieu", maLoaiDuLieu != null ? maLoaiDuLieu : "",
                "requestTopic", requestTopic
        ));
    }

    public void fileDownloadSkipped(String fileId, String phienBan) {
        info("[FLINK] File download skipped (duplicate): fileId=" + fileId, Map.of(
                "fileId", fileId,
                "phienBan", phienBan != null ? phienBan : ""
        ));
    }

    public void statsFlush(long recordsIn, long recordsValid, long recordsInvalid,
                           long published, long fileRequested) {
        info("[FLINK] Stats: in=" + recordsIn + " valid=" + recordsValid + " invalid=" + recordsInvalid
                + " published=" + published + " fileRequested=" + fileRequested, Map.of(
                "records.in", recordsIn,
                "records.valid", recordsValid,
                "records.invalid", recordsInvalid,
                "records.published", published,
                "records.fileRequested", fileRequested
        ));
    }

    public void firstRecordReceived(String topic, String key) {
        info("[FLINK] First record received: topic=" + topic, Map.of(
                "topic", topic,
                "key", key != null ? key : ""
        ));
    }

    public void checkpointCompleted(long checkpointId, long durationMs) {
        info("[FLINK] Checkpoint completed: id=" + checkpointId + " duration=" + durationMs + "ms", Map.of(
                "checkpointId", checkpointId,
                "durationMs", durationMs
        ));
    }

    public void checkpointFailed(long checkpointId, String reason) {
        error("[FLINK-ERROR] Checkpoint failed: id=" + checkpointId, Map.of(
                "checkpointId", checkpointId,
                "reason", reason != null ? reason : ""
        ), null);
    }

    public void cdpTopicCreated(String topic, int partitions) {
        info("[FLINK] CDP topic created: " + topic + " partitions=" + partitions, Map.of(
                "topic", topic,
                "partitions", partitions
        ));
    }

    public void cdpTopicExisted(String topic) {
        info("[FLINK] CDP topic already exists: " + topic, Map.of("topic", topic));
    }

    public void fileDownloadSendFailed(String fileId, String requestTopic, String error) {
        error("[FLINK-ERROR] File download send failed: fileId=" + fileId + " topic=" + requestTopic, Map.of(
                "fileId", fileId != null ? fileId : "",
                "requestTopic", requestTopic != null ? requestTopic : "",
                "error", error != null ? error : ""
        ), null);
    }

    public void taskRestarted(int attempt, String reason) {
        error("[FLINK-ERROR] Task restarted: attempt=" + attempt + " reason=" + reason, Map.of(
                "attempt", attempt,
                "reason", reason != null ? reason : ""
        ), null);
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private void emit(Severity severity, String event, Map<String, Object> attrs, Throwable ex) {
        try {
            LogRecordBuilder builder = logger.logRecordBuilder()
                    .setSeverity(severity)
                    .setSeverityText(severity.name().toLowerCase())
                    .setBody(event)
                    .setTimestamp(Instant.now().toEpochMilli(), TimeUnit.MILLISECONDS)
                    .setAttribute(KEY_EVENT, event)
                    .setAttribute(KEY_JOB, jobName);

            if (attrs != null) {
                for (Map.Entry<String, Object> entry : attrs.entrySet()) {
                    Object val = entry.getValue();
                    if (val instanceof String) {
                        builder.setAttribute(AttributeKey.stringKey(entry.getKey()), (String) val);
                    } else if (val instanceof Long) {
                        builder.setAttribute(AttributeKey.longKey(entry.getKey()), (Long) val);
                    } else if (val instanceof Integer) {
                        builder.setAttribute(AttributeKey.longKey(entry.getKey()), ((Integer) val).longValue());
                    } else if (val instanceof Boolean) {
                        builder.setAttribute(AttributeKey.booleanKey(entry.getKey()), (Boolean) val);
                    } else if (val != null) {
                        builder.setAttribute(AttributeKey.stringKey(entry.getKey()), val.toString());
                    }
                }
            }

            if (ex != null) {
                builder.setAttribute(KEY_ERROR, ex.getMessage() != null ? ex.getMessage() : ex.getClass().getName());
            }

            builder.emit();
        } catch (Exception e) {
            // OTel failure must not break the job
        }
    }

    @Override
    public void close() {
        try {
            sdk.getSdkLoggerProvider().forceFlush().join(5, TimeUnit.SECONDS);
            sdk.close();
        } catch (Exception ignored) {
        }
    }
}
