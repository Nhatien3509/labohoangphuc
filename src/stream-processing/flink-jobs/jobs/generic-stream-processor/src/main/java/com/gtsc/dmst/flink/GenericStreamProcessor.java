package com.gtsc.dmst.flink;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.flink.api.common.typeinfo.TypeInformation;
import org.apache.flink.api.java.utils.ParameterTool;
import org.apache.flink.api.common.serialization.SerializationSchema;
import org.apache.flink.connector.base.DeliveryGuarantee;
import org.apache.flink.connector.kafka.sink.KafkaRecordSerializationSchema;
import org.apache.flink.connector.kafka.sink.KafkaSink;
import org.apache.flink.connector.kafka.source.KafkaSource;
import org.apache.flink.connector.kafka.source.KafkaSourceBuilder;
import org.apache.flink.connector.kafka.source.enumerator.initializer.OffsetsInitializer;
import org.apache.flink.connector.kafka.source.reader.deserializer.KafkaRecordDeserializationSchema;
import org.apache.flink.streaming.api.CheckpointingMode;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.util.Collector;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.errors.TopicExistsException;
import org.apache.kafka.common.serialization.StringSerializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.gtsc.dmst.flink.file.FileDownloadFunction;
import com.gtsc.dmst.flink.metadata.DataSourceMetadata;
import com.gtsc.dmst.flink.metadata.MetadataService;
import com.gtsc.dmst.flink.transformer.DataTransformer;
import com.gtsc.dmst.flink.validator.SchemaValidator;

import java.io.Serializable;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import java.util.regex.Pattern;

public class GenericStreamProcessor {
    private static final Logger LOG = LoggerFactory.getLogger(GenericStreamProcessor.class);
    private static final ObjectMapper mapper = new ObjectMapper();
    private static final String DEFAULT_CDP_METADATA_TOPIC_PREFIX = "";
    private static final String DEFAULT_CDP_METADATA_TOPIC_FIELD = "maLoaiDuLieu";
    private static final String DEFAULT_KAFKA_STARTING_OFFSET = "latest";

    public static void main(String[] args) throws Exception {
        ParameterTool fileParams = ParameterTool.fromPropertiesFile(
                GenericStreamProcessor.class.getResourceAsStream("/config.properties"));
        ParameterTool parameters = fileParams.mergeWith(ParameterTool.fromArgs(args));

        String metadataId      = parameters.get("metadata.id", "");
        String executionId     = parameters.get("execution.id", UUID.randomUUID().toString());
        String otelEndpoint    = parameters.get("otel.endpoint", "");
        String otelServiceName = parameters.get("otel.service.name", "flink-" + metadataId);
        String kafkaBrokers    = parameters.get("kafka.brokers", "localhost:9092");
        String kafkaCdpBrokers = parameters.get("kafka.cdp.brokers", "160.191.32.149:9092");
        int kafkaCdpMetadataTopicPartitions = parameters.getInt("kafka.cdp.metadata.topic.partitions", 3);
        short kafkaCdpMetadataTopicReplicationFactor = (short) parameters.getInt("kafka.cdp.metadata.topic.replication.factor", 1);
        int kafkaFileRequestTopicPartitions = parameters.getInt("kafka.file.request.topic.partitions", 3);
        short kafkaFileRequestTopicReplicationFactor = (short) parameters.getInt("kafka.file.request.topic.replication.factor", 1);
        String dbHost          = parameters.get("db.host", "postgres-db");
        int    dbPort          = parameters.getInt("db.port", 5432);
        String dbName          = parameters.get("db.name", "DMST_Integration_DB");
        String dbUser          = parameters.get("db.user", "postgres");
        String dbPass          = parameters.get("db.password", "Abcd@123456");
        int    parallelism     = parameters.getInt("parallelism", 4);
        int    checkpointMs    = parameters.getInt("checkpoint.interval", 60000);
        int    statsIntervalS  = parameters.getInt("stats.interval", 30);
        long   partitionDiscoveryIntervalMs = parameters.getLong("kafka.partition.discovery.interval.ms", 60000);

        if (metadataId.isEmpty()) {
            throw new IllegalArgumentException("metadata.id is required");
        }

        LOG.info("Starting GenericStreamProcessor metadata.id={} execution.id={}", metadataId, executionId);

        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
        env.setParallelism(parallelism);
        env.enableCheckpointing(checkpointMs, CheckpointingMode.AT_LEAST_ONCE);

        MetadataService metadataService = new MetadataService(dbHost, dbPort, dbName, dbUser, dbPass);
        DataSourceMetadata metadata = metadataService.loadMetadata(metadataId);
        String kafkaSourceTopicPattern = firstNonBlank(
                parameters.get("kafka.source.topic.pattern", ""),
                parameters.get("kafka.topic.pattern", ""));
        String kafkaSourceTopics = firstNonBlank(
                parameters.get("kafka.source.topic", ""),
                parameters.get("kafka.topic", ""),
                metadata.getKafkaTopicPattern());
        if (kafkaSourceTopicPattern.isEmpty() && kafkaSourceTopics.isEmpty()) {
            throw new IllegalArgumentException("kafka.source.topic or kafka.source.topic.pattern is required: " + metadataId);
        }
        String kafkaCdpMetadataTopicPrefix = parameters.has("kafka.cdp.metadata.topic.prefix")
                ? parameters.get("kafka.cdp.metadata.topic.prefix")
                : defaultIfBlank(metadata.getKafkaCdpMetadataTopicPrefix(), DEFAULT_CDP_METADATA_TOPIC_PREFIX);
        String kafkaCdpMetadataTopicField = parameters.has("kafka.cdp.metadata.topic.field")
                ? parameters.get("kafka.cdp.metadata.topic.field")
                : defaultIfBlank(metadata.getKafkaCdpMetadataTopicField(), DEFAULT_CDP_METADATA_TOPIC_FIELD);
        String configuredKafkaCdpMetadataTopic = firstNonBlank(
                parameters.get("kafka.cdp.metadata.topic", ""),
                parameters.get("kafka.sink.topic", ""),
                parameters.get("kafka.output.topic", ""));
        String kafkaCdpMetadataTopic = configuredKafkaCdpMetadataTopic;
        String kafkaStartingOffset = parameters.has("kafka.starting.offset")
                ? parameters.get("kafka.starting.offset")
                : defaultIfBlank(metadata.getKafkaStartingOffset(), DEFAULT_KAFKA_STARTING_OFFSET);
        OffsetsInitializer startingOffsets = resolveStartingOffsets(kafkaStartingOffset);
        String sourceDescriptor = kafkaSourceTopicPattern.isEmpty()
                ? kafkaSourceTopics
                : "pattern:" + kafkaSourceTopicPattern;

        LOG.info("Loaded: {} | source={} | sinkTopic={} | startingOffset={} | partitionDiscoveryIntervalMs={} | hdfs={}",
                metadata.getName(),
                sourceDescriptor,
                kafkaCdpMetadataTopic == null || kafkaCdpMetadataTopic.isEmpty() ? "<source-topic>" : kafkaCdpMetadataTopic,
                kafkaStartingOffset,
                partitionDiscoveryIntervalMs,
                metadata.getSinkHdfsPath());

        // Shared counters — updated by sink, read by StatsReporter
        AtomicLong recordsIn              = new AtomicLong(0);
        AtomicLong recordsValid           = new AtomicLong(0);
        AtomicLong recordsInvalid         = new AtomicLong(0);
        AtomicLong recordsKafkaPublished  = new AtomicLong(0);
        AtomicLong recordsHdfsWritten     = new AtomicLong(0);
        AtomicLong recordsHdfsWriteFailed = new AtomicLong(0);
        AtomicLong recordsFileRequested   = new AtomicLong(0);

        // OTel logger — disabled if endpoint not configured
        OtelLogger otel = otelEndpoint.isEmpty()
                ? null
                : new OtelLogger(otelEndpoint, otelServiceName, metadataId);
        if (otel != null) {
            otel.jobStarted(metadata.getName(), sourceDescriptor, kafkaStartingOffset);
        }

        // Start stats reporter background thread
        String jdbcUrl = String.format("jdbc:postgresql://%s:%d/%s", dbHost, dbPort, dbName);
        StatsReporter reporter = new StatsReporter(
                executionId, jdbcUrl, dbUser, dbPass,
                recordsIn, recordsValid, recordsInvalid,
                recordsKafkaPublished, recordsHdfsWritten, recordsHdfsWriteFailed, recordsFileRequested,
                otel
        );
        reporter.start(statsIntervalS);

        KafkaSource<KafkaEnvelope> kafkaSource = buildKafkaSource(
                kafkaBrokers,
                kafkaSourceTopics,
                kafkaSourceTopicPattern,
                "flink-" + sanitizeGroupId(metadataId + "-" + sourceDescriptor),
                startingOffsets,
                kafkaStartingOffset,
                partitionDiscoveryIntervalMs);

        DataStream<KafkaEnvelope> kafkaStream = env.fromSource(
                kafkaSource,
                org.apache.flink.api.common.eventtime.WatermarkStrategy.noWatermarks(),
                "Kafka Source");

        SchemaValidator validator = new SchemaValidator(metadata);
        DataTransformer transformer = new DataTransformer(metadata);

        DataStream<KafkaEnvelope> dedupedStream = kafkaStream
                .keyBy(envelope -> envelope.getTopic() + "|" + (envelope.getKey() != null ? envelope.getKey() : ""))
                .process(new com.gtsc.dmst.flink.filter.RecordVersionDedupFunction(otel))
                .name("Record Version Dedup - " + metadata.getName());

        DataStream<ProcessedRecord> processedStream = dedupedStream
                .filter(envelope -> {
                    recordsIn.incrementAndGet();
                    String failedField = validator.validateWithReason(envelope.getValue());
                    if (failedField != null) {
                        recordsInvalid.incrementAndGet();
                        String msgSample = envelope.getValue() != null && envelope.getValue().length() > 200
                                ? envelope.getValue().substring(0, 200) + "..."
                                : envelope.getValue();
                        LOG.warn("Validation failed, dropping message from topic={} field={} sample={}",
                                envelope.getTopic(), failedField, msgSample);
                        if (otel != null) otel.validationFailed(envelope.getTopic(), failedField,
                                "required field missing or type mismatch");
                        return false;
                    }
                    recordsValid.incrementAndGet();
                    return true;
                })
                .map(envelope -> {
                    try {
                        return new ProcessedRecord(
                                envelope.getTopic(),
                                envelope.getKey(),
                                transformer.transform(envelope.getValue()));
                    } catch (Exception e) {
                        LOG.error("Transform failed: {}", e.getMessage());
                        if (otel != null) otel.transformFailed(envelope.getTopic(), e.getMessage());
                        throw new RuntimeException(e);
                    }
                });

        MetadataTopicEnsurer topicEnsurer = new MetadataTopicEnsurer(
                kafkaCdpBrokers, kafkaCdpMetadataTopicPartitions, kafkaCdpMetadataTopicReplicationFactor);

        KafkaSink<ProcessedRecord> cdpSink = KafkaSink.<ProcessedRecord>builder()
                .setBootstrapServers(kafkaCdpBrokers)
                .setRecordSerializer(new MetadataRecordSerializer(
                        kafkaCdpMetadataTopic,
                        kafkaCdpMetadataTopicPrefix,
                        kafkaCdpMetadataTopicField,
                        topicEnsurer,
                        recordsKafkaPublished,
                        recordsHdfsWriteFailed,
                        otel))
                .setDeliveryGuarantee(DeliveryGuarantee.AT_LEAST_ONCE)
                .setKafkaProducerConfig(buildCdpProducerProps(kafkaCdpBrokers))
                .build();

        processedStream
                .sinkTo(cdpSink)
                .name("Kafka CDP Metadata Sink - " + metadata.getName());

        LOG.info("Kafka CDP metadata sink configured (AT_LEAST_ONCE): brokers={} topic={} prefix={} topicField={} partitions={} replicationFactor={}",
                kafkaCdpBrokers,
                kafkaCdpMetadataTopic == null || kafkaCdpMetadataTopic.isEmpty() ? "<source-topic>" : kafkaCdpMetadataTopic,
                kafkaCdpMetadataTopicPrefix,
                kafkaCdpMetadataTopicField,
                kafkaCdpMetadataTopicPartitions,
                kafkaCdpMetadataTopicReplicationFactor);

        if (metadata.isFileDownloadEnabled() && metadata.getFileFieldConfig() != null) {
            processedStream
                    .map(ProcessedRecord::getValue)
                    .keyBy(record -> {
                        try {
                            Map<?, ?> r = mapper.readValue(record, Map.class);
                            Object fileId = r.get("fileId");
                            if (fileId == null) fileId = r.get("itemId");
                            if (fileId == null) fileId = r.get("id");
                            return fileId != null ? fileId.toString() : metadataId;
                        } catch (Exception e) {
                            return metadataId;
                        }
                    })
                    .process(new FileDownloadFunction(
                            metadata.getFileFieldConfig(), kafkaBrokers,
                            metadataId, metadata.getSinkHdfsPath(), recordsFileRequested,
                            kafkaFileRequestTopicPartitions, kafkaFileRequestTopicReplicationFactor, otel))
                    .name("File Download Trigger - " + metadata.getName());

            LOG.info("File download enabled for metadata.id={} requestTopicPartitions={} requestTopicReplicationFactor={}",
                    metadataId, kafkaFileRequestTopicPartitions, kafkaFileRequestTopicReplicationFactor);
        }

        try {
            env.execute("Generic Stream Processor - " + metadata.getName());
            reporter.stop();
            if (otel != null) otel.info("[FLINK] Job stopped: " + metadataId, Map.of(
                    "reason", "normal shutdown",
                    "metadataId", metadataId,
                    "executionId", executionId
            ));
        } catch (Exception e) {
            String errMsg = e.getMessage() != null ? e.getMessage() : e.getClass().getName();
            reporter.markFailed(errMsg);
            if (otel != null) otel.error("[FLINK] Job failed: " + metadataId, Map.of(
                    "metadataId", metadataId,
                    "executionId", executionId,
                    "errorClass", e.getClass().getName(),
                    "error", errMsg
            ), e);
            throw e;
        } finally {
            reporter.flush();
            metadataService.close();
            if (otel != null) otel.close();
        }
    }

    static String extractMaDinhDanh(String json) {
        if (json == null) return "";
        try {
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(json);
            com.fasterxml.jackson.databind.JsonNode duLieu = findNodeIgnoreCase(root, "duLieuTiepNhan");
            if (duLieu == null) return "";
            com.fasterxml.jackson.databind.JsonNode id = findNodeIgnoreCase(duLieu, "maDinhDanhDuLieu");
            return id != null ? id.asText("") : "";
        } catch (Exception e) {
            return "";
        }
    }

    private static com.fasterxml.jackson.databind.JsonNode findNodeIgnoreCase(
            com.fasterxml.jackson.databind.JsonNode parent, String fieldName) {
        if (parent == null || !parent.isObject()) return null;
        com.fasterxml.jackson.databind.JsonNode direct = parent.get(fieldName);
        if (direct != null) return direct;
        String lower = fieldName.toLowerCase();
        java.util.Iterator<String> names = parent.fieldNames();
        while (names.hasNext()) {
            String name = names.next();
            if (name.toLowerCase().equals(lower)) return parent.get(name);
        }
        return null;
    }

    private static KafkaSource<KafkaEnvelope> buildKafkaSource(String kafkaBrokers,
                                                               String kafkaSourceTopics,
                                                               String kafkaSourceTopicPattern,
                                                               String groupId,
                                                               OffsetsInitializer startingOffsets,
                                                               String kafkaStartingOffset,
                                                               long partitionDiscoveryIntervalMs) {
        // auto.offset.reset controls behavior for newly discovered partitions (no committed offset).
        // Must match kafkaStartingOffset so new topics in a pattern don't silently read from earliest.
        String autoOffsetReset = "earliest".equalsIgnoreCase(kafkaStartingOffset) ? "earliest" : "latest";
        KafkaSourceBuilder<KafkaEnvelope> builder = KafkaSource.<KafkaEnvelope>builder()
                .setBootstrapServers(kafkaBrokers)
                .setGroupId(groupId)
                .setStartingOffsets(startingOffsets)
                .setDeserializer(new KafkaEnvelopeDeserializer())
                .setProperty("auto.offset.reset", autoOffsetReset);

        if (kafkaSourceTopicPattern != null && !kafkaSourceTopicPattern.trim().isEmpty()) {
            if (partitionDiscoveryIntervalMs > 0) {
                builder.setProperty("partition.discovery.interval.ms", Long.toString(partitionDiscoveryIntervalMs));
            }
            return builder
                    .setTopicPattern(Pattern.compile(kafkaSourceTopicPattern.trim()))
                    .build();
        }

        List<String> topics = Arrays.stream(kafkaSourceTopics.split(","))
                .map(String::trim)
                .filter(topic -> !topic.isEmpty())
                .toList();
        if (topics.isEmpty()) {
            throw new IllegalArgumentException("kafka source topic list is empty");
        }
        return builder.setTopics(topics).build();
    }

    private static String defaultIfBlank(String value, String fallback) {
        if (value == null || value.trim().isEmpty()) {
            return fallback;
        }
        return value;
    }

    private static String firstNonBlank(String... values) {
        if (values == null) {
            return "";
        }
        for (String value : values) {
            if (value != null && !value.trim().isEmpty()) {
                return value.trim();
            }
        }
        return "";
    }

    private static Properties buildCdpProducerProps(String brokers) {
        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, brokers);
        props.put(ProducerConfig.ACKS_CONFIG, "all");
        props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, "true");
        props.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, "1");
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, org.apache.kafka.common.serialization.ByteArraySerializer.class.getName());
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, org.apache.kafka.common.serialization.ByteArraySerializer.class.getName());
        return props;
    }

    private static String sanitizeGroupId(String value) {
        return firstNonBlank(value, "default")
                .replaceAll("[^A-Za-z0-9._-]", "_")
                .replaceAll("_+", "_");
    }

    private static OffsetsInitializer resolveStartingOffsets(String value) {
        String normalized = defaultIfBlank(value, DEFAULT_KAFKA_STARTING_OFFSET)
                .trim()
                .toLowerCase(Locale.ROOT);
        switch (normalized) {
            case "earliest":
                return OffsetsInitializer.earliest();
            case "latest":
                return OffsetsInitializer.latest();
            default:
                throw new IllegalArgumentException("kafkaStartingOffset must be either 'earliest' or 'latest': " + value);
        }
    }

    // #region Record wrappers

    public static class KafkaEnvelope implements Serializable {
        private static final long serialVersionUID = 1L;

        private String topic;
        private String key;
        private String value;

        public KafkaEnvelope() {
        }

        public KafkaEnvelope(String topic, String key, String value) {
            this.topic = topic;
            this.key = key;
            this.value = value;
        }

        public String getTopic() {
            return topic;
        }

        public void setTopic(String topic) {
            this.topic = topic;
        }

        public String getKey() {
            return key;
        }

        public void setKey(String key) {
            this.key = key;
        }

        public String getValue() {
            return value;
        }

        public void setValue(String value) {
            this.value = value;
        }
    }

    public static class ProcessedRecord implements Serializable {
        private static final long serialVersionUID = 1L;

        private String sourceTopic;
        private String sourceKey;
        private String value;

        public ProcessedRecord() {
        }

        public ProcessedRecord(String sourceTopic, String sourceKey, String value) {
            this.sourceTopic = sourceTopic;
            this.sourceKey = sourceKey;
            this.value = value;
        }

        public String getSourceTopic() {
            return sourceTopic;
        }

        public void setSourceTopic(String sourceTopic) {
            this.sourceTopic = sourceTopic;
        }

        public String getSourceKey() {
            return sourceKey;
        }

        public void setSourceKey(String sourceKey) {
            this.sourceKey = sourceKey;
        }

        public String getValue() {
            return value;
        }

        public void setValue(String value) {
            this.value = value;
        }
    }

    static class KafkaEnvelopeDeserializer implements KafkaRecordDeserializationSchema<KafkaEnvelope> {
        private static final long serialVersionUID = 1L;

        @Override
        public void deserialize(ConsumerRecord<byte[], byte[]> record, Collector<KafkaEnvelope> out) {
            String key = record.key() == null ? null : new String(record.key(), StandardCharsets.UTF_8);
            String value = record.value() == null ? "" : new String(record.value(), StandardCharsets.UTF_8);
            out.collect(new KafkaEnvelope(record.topic(), key, value));
        }

        @Override
        public TypeInformation<KafkaEnvelope> getProducedType() {
            return TypeInformation.of(KafkaEnvelope.class);
        }
    }

    // #endregion

    // #region StatsReporter

    static class StatsReporter {
        private static final Logger LOG = LoggerFactory.getLogger(StatsReporter.class);

        private final String executionId;
        private final String jdbcUrl;
        private final String dbUser;
        private final String dbPass;
        private final AtomicLong recordsIn;
        private final AtomicLong recordsValid;
        private final AtomicLong recordsInvalid;
        private final AtomicLong recordsKafkaPublished;
        private final AtomicLong recordsHdfsWritten;
        private final AtomicLong recordsHdfsWriteFailed;
        private final AtomicLong recordsFileRequested;
        private final Instant jobStartTime;
        private final ScheduledExecutorService scheduler;
        private final OtelLogger otel;
        private int checkpointCount = 0;
        private String lastError = "";
        private volatile String jobStatus = "RUNNING";

        StatsReporter(String executionId, String jdbcUrl, String dbUser, String dbPass,
                      AtomicLong recordsIn, AtomicLong recordsValid,
                      AtomicLong recordsInvalid, AtomicLong recordsKafkaPublished,
                      AtomicLong recordsHdfsWritten, AtomicLong recordsHdfsWriteFailed,
                      AtomicLong recordsFileRequested, OtelLogger otel) {
            this.executionId            = executionId;
            this.jdbcUrl                = jdbcUrl;
            this.dbUser                 = dbUser;
            this.dbPass                 = dbPass;
            this.recordsIn              = recordsIn;
            this.recordsValid           = recordsValid;
            this.recordsInvalid         = recordsInvalid;
            this.recordsKafkaPublished  = recordsKafkaPublished;
            this.recordsHdfsWritten     = recordsHdfsWritten;
            this.recordsHdfsWriteFailed = recordsHdfsWriteFailed;
            this.recordsFileRequested   = recordsFileRequested;
            this.otel                   = otel;
            this.jobStartTime           = Instant.now();
            this.scheduler              = Executors.newSingleThreadScheduledExecutor(r -> {
                Thread t = new Thread(r, "flink-stats-reporter");
                t.setDaemon(true);
                return t;
            });
        }

        void start(int intervalSeconds) {
            flush(); // initial insert with RUNNING status
            scheduler.scheduleAtFixedRate(this::flush, intervalSeconds, intervalSeconds, TimeUnit.SECONDS);
            LOG.info("StatsReporter started, interval={}s execution.id={}", intervalSeconds, executionId);
        }

        void stop() {
            scheduler.shutdown();
            jobStatus = "STOPPED";
        }

        void markFailed(String error) {
            jobStatus = "FAILED";
            lastError = error.length() > 500 ? error.substring(0, 500) : error;
        }

        private String computeIngestionStatus() {
            long written = recordsHdfsWritten.get() + recordsKafkaPublished.get();
            long failed  = recordsHdfsWriteFailed.get();
            long in      = recordsIn.get();
            if (in == 0)              return "IDLE";
            if (written > 0 && failed == 0) return "SUCCESS";
            if (written > 0 && failed > 0)  return "PARTIAL";
            if (written == 0 && failed > 0) return "ERROR";
            return "IDLE";
        }

        void flush() {
            checkpointCount++;
            String ingestionStatus = computeIngestionStatus();
            String sql = "INSERT INTO flink_stream_stats " +
                    "(id, execution_id, job_status, ingestion_status, " +
                    " records_in, records_valid, records_invalid, " +
                    " records_kafka_published, records_hdfs_written, records_hdfs_failed, " +
                    " records_file_requested, last_error, " +
                    " checkpoint_count, last_checkpoint_at, job_start_time, updated_at) " +
                    "VALUES (gen_random_uuid(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()) " +
                    "ON CONFLICT (execution_id) DO UPDATE SET " +
                    "  job_status              = EXCLUDED.job_status, " +
                    "  ingestion_status        = EXCLUDED.ingestion_status, " +
                    "  records_in              = EXCLUDED.records_in, " +
                    "  records_valid           = EXCLUDED.records_valid, " +
                    "  records_invalid         = EXCLUDED.records_invalid, " +
                    "  records_kafka_published = EXCLUDED.records_kafka_published, " +
                    "  records_hdfs_written    = EXCLUDED.records_hdfs_written, " +
                    "  records_hdfs_failed     = EXCLUDED.records_hdfs_failed, " +
                    "  records_file_requested  = EXCLUDED.records_file_requested, " +
                    "  last_error              = EXCLUDED.last_error, " +
                    "  checkpoint_count        = EXCLUDED.checkpoint_count, " +
                    "  last_checkpoint_at      = EXCLUDED.last_checkpoint_at, " +
                    "  updated_at              = NOW()";

            try (Connection conn = DriverManager.getConnection(jdbcUrl, dbUser, dbPass);
                 PreparedStatement stmt = conn.prepareStatement(sql)) {

                stmt.setString(1, executionId);
                stmt.setString(2, jobStatus);
                stmt.setString(3, ingestionStatus);
                stmt.setLong(4, recordsIn.get());
                stmt.setLong(5, recordsValid.get());
                stmt.setLong(6, recordsInvalid.get());
                stmt.setLong(7, recordsKafkaPublished.get());
                stmt.setLong(8, recordsHdfsWritten.get());
                stmt.setLong(9, recordsHdfsWriteFailed.get());
                stmt.setLong(10, recordsFileRequested.get());
                stmt.setString(11, lastError.length() > 500 ? lastError.substring(0, 500) : lastError);
                stmt.setInt(12, checkpointCount);
                stmt.setTimestamp(13, Timestamp.from(Instant.now()));
                stmt.setTimestamp(14, Timestamp.from(jobStartTime));

                stmt.executeUpdate();

                LOG.debug("Stats flushed: job_status={} ingestion_status={} in={} valid={} invalid={} metadata_published={} hdfs_ok={} failed={}",
                        jobStatus, ingestionStatus,
                        recordsIn.get(), recordsValid.get(), recordsInvalid.get(),
                        recordsKafkaPublished.get(), recordsHdfsWritten.get(), recordsHdfsWriteFailed.get());

                if (otel != null) {
                    otel.statsFlush(recordsIn.get(), recordsValid.get(), recordsInvalid.get(),
                            recordsKafkaPublished.get(), recordsFileRequested.get());
                    otel.checkpointCompleted(checkpointCount, 0);
                }

            } catch (Exception e) {
                lastError = e.getMessage();
                LOG.error("Stats flush failed: {}", e.getMessage());
            }
        }
    }

    // #endregion

    // #region MetadataTopicEnsurer

    static class MetadataTopicEnsurer implements Serializable {
        private static final long serialVersionUID = 1L;
        private static final Logger LOG = LoggerFactory.getLogger(MetadataTopicEnsurer.class);

        private final String kafkaBrokers;
        private final int topicPartitions;
        private final short topicReplicationFactor;
        private transient AdminClient adminClient;
        private transient Set<String> ensuredTopics;

        MetadataTopicEnsurer(String kafkaBrokers, int topicPartitions, short topicReplicationFactor) {
            this.kafkaBrokers          = kafkaBrokers;
            this.topicPartitions       = topicPartitions;
            this.topicReplicationFactor = topicReplicationFactor;
        }

        // Returns true if topic was newly created, false if already existed
        boolean ensureTopicExists(String topic) throws Exception {
            if (ensuredTopics == null) {
                Properties props = new Properties();
                props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaBrokers);
                adminClient    = AdminClient.create(props);
                ensuredTopics  = ConcurrentHashMap.newKeySet();
            }
            if (ensuredTopics.contains(topic)) {
                return false;
            }
            boolean created = false;
            try {
                NewTopic newTopic = new NewTopic(topic, topicPartitions, topicReplicationFactor);
                adminClient.createTopics(Collections.singleton(newTopic)).all().get();
                LOG.info("Kafka CDP topic created: topic={} partitions={} replicationFactor={}",
                        topic, topicPartitions, topicReplicationFactor);
                created = true;
            } catch (ExecutionException e) {
                if (!(e.getCause() instanceof TopicExistsException)) {
                    throw e;
                }
                LOG.info("Kafka CDP topic already exists: {}", topic);
            }
            ensuredTopics.add(topic);
            return created;
        }
    }

    // #endregion

    // #region MetadataRecordSerializer

    static class MetadataRecordSerializer implements KafkaRecordSerializationSchema<ProcessedRecord> {
        private static final long serialVersionUID = 1L;
        private static final Logger LOG = LoggerFactory.getLogger(MetadataRecordSerializer.class);

        private final String staticTopic;
        private final String topicPrefix;
        private final String topicField;
        private final MetadataTopicEnsurer topicEnsurer;
        private final AtomicLong recordsPublished;
        private final AtomicLong recordsFailed;
        private final OtelLogger otel;
        private transient ObjectMapper objectMapper;
        private transient boolean firstRecordLogged;

        MetadataRecordSerializer(String staticTopic, String topicPrefix, String topicField,
                                 MetadataTopicEnsurer topicEnsurer,
                                 AtomicLong recordsPublished, AtomicLong recordsFailed,
                                 OtelLogger otel) {
            this.staticTopic      = staticTopic;
            this.topicPrefix      = topicPrefix;
            this.topicField       = topicField;
            this.topicEnsurer     = topicEnsurer;
            this.recordsPublished = recordsPublished;
            this.recordsFailed    = recordsFailed;
            this.otel             = otel;
        }

        @Override
        public void open(SerializationSchema.InitializationContext context,
                         KafkaRecordSerializationSchema.KafkaSinkContext sinkContext) throws Exception {
            this.objectMapper = new ObjectMapper();
        }

        @Override
        public ProducerRecord<byte[], byte[]> serialize(ProcessedRecord record,
                                                        KafkaRecordSerializationSchema.KafkaSinkContext sinkContext,
                                                        Long timestamp) {
            try {
                String topic = resolveTopic(record);
                if (topic == null) {
                    recordsFailed.incrementAndGet();
                    if (otel != null) otel.cdpPublishFailed(
                            record.getSourceTopic() != null ? record.getSourceTopic() : "",
                            "could not resolve target topic — missing topic field or prefix");
                    return null;
                }
                String value = record.getValue();
                String key   = resolveKey(value);
                if (key == null || key.trim().isEmpty()) {
                    key = record.getSourceKey();
                }
                boolean topicCreated = topicEnsurer.ensureTopicExists(topic);
                if (otel != null) {
                    if (topicCreated) otel.cdpTopicCreated(topic, 0);
                    else if (recordsPublished.get() == 0) otel.cdpTopicExisted(topic);
                }
                if (!firstRecordLogged) {
                    firstRecordLogged = true;
                    if (otel != null) otel.firstRecordReceived(record.getSourceTopic(), key);
                }
                recordsPublished.incrementAndGet();
                if (otel != null) otel.cdpPublished(topic, key, recordsPublished.get());
                byte[] keyBytes   = key != null ? key.getBytes(StandardCharsets.UTF_8) : null;
                byte[] valueBytes = value.getBytes(StandardCharsets.UTF_8);
                return new ProducerRecord<>(topic, null, keyBytes, valueBytes);
            } catch (Exception e) {
                recordsFailed.incrementAndGet();
                LOG.error("Kafka CDP metadata serialize failed: {}", e.getMessage());
                if (otel != null) otel.cdpPublishFailed(
                        record.getSourceTopic() != null ? record.getSourceTopic() : "",
                        e.getMessage() != null ? e.getMessage() : e.getClass().getName()
                );
                throw new RuntimeException(e);
            }
        }

        private String resolveTopic(ProcessedRecord processedRecord) throws Exception {
            if (staticTopic != null && !staticTopic.isEmpty()) {
                return staticTopic;
            }
            if (topicPrefix == null || topicPrefix.trim().isEmpty()) {
                String sourceTopic = processedRecord.getSourceTopic();
                if (sourceTopic == null || sourceTopic.trim().isEmpty()) {
                    LOG.warn("Drop metadata record because source topic is missing");
                    return null;
                }
                return sourceTopic;
            }
            String value     = processedRecord.getValue();
            Map<?, ?> parsed = objectMapper.readValue(value, Map.class);
            Object topicValue = getFieldValue(parsed, topicField);
            if (topicValue == null) topicValue = getFieldValue(parsed, "nguonDuLieu.maLoaiDuLieu");
            if (topicValue == null) topicValue = parsed.get("maLoaiDuLieu");
            if (topicValue == null) topicValue = parsed.get("ma_loai_du_lieu");
            if (topicValue == null) topicValue = parsed.get("MA_LOAI_DL");
            if (topicValue == null) topicValue = parsed.get("kieuDl");
            if (topicValue == null || topicValue.toString().trim().isEmpty()) {
                LOG.warn("Drop metadata record because topic field is missing: field={}", topicField);
                return null;
            }
            return topicPrefix + sanitizeTopicSuffix(topicValue.toString());
        }

        private Object getFieldValue(Map<?, ?> record, String fieldPath) {
            if (fieldPath == null || fieldPath.trim().isEmpty()) return null;
            Object value = record.get(fieldPath);
            if (value != null || !fieldPath.contains(".")) return value;
            Object current = record;
            for (String part : fieldPath.split("\\.")) {
                if (!(current instanceof Map)) return null;
                current = ((Map<?, ?>) current).get(part);
                if (current == null) return null;
            }
            return current;
        }

        private String resolveKey(String value) {
            try {
                Map<?, ?> record = objectMapper.readValue(value, Map.class);
                for (String keyField : new String[]{"dataset_id", "datasetId", "itemId", "id"}) {
                    Object key = record.get(keyField);
                    if (key != null && !key.toString().trim().isEmpty()) {
                        return key.toString();
                    }
                }
            } catch (Exception e) {
                LOG.warn("resolve kafka key failed: {}", e.getMessage());
            }
            return null;
        }

        private static String sanitizeTopicSuffix(String value) {
            String normalized = value.trim().toUpperCase(Locale.ROOT)
                    .replaceAll("[^A-Z0-9_\\-\\.]", "_")
                    .replaceAll("_+", "_");
            if (normalized.startsWith("_")) normalized = normalized.substring(1);
            if (normalized.endsWith("_"))   normalized = normalized.substring(0, normalized.length() - 1);
            if (normalized.isEmpty()) throw new IllegalArgumentException("empty metadata topic suffix");
            return normalized;
        }
    }

    // #endregion
}
