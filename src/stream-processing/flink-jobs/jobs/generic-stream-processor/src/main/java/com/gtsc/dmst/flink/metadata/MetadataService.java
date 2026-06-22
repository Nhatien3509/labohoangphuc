package com.gtsc.dmst.flink.metadata;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gtsc.dmst.flink.file.FileFieldConfig;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.HashMap;
import java.util.Map;

public class MetadataService {
    private static final Logger LOG = LoggerFactory.getLogger(MetadataService.class);
    private static final ObjectMapper mapper = new ObjectMapper();
    private final HikariDataSource dataSource;
    private final Map<String, DataSourceMetadata> cache = new HashMap<>();

    public MetadataService(String dbHost, int dbPort, String dbName, String dbUser, String dbPass) {
        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.postgresql.Driver");
        config.setJdbcUrl(String.format("jdbc:postgresql://%s:%d/%s", dbHost, dbPort, dbName));
        config.setUsername(dbUser);
        config.setPassword(dbPass);
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setConnectionTimeout(10000);
        config.setIdleTimeout(30000);
        this.dataSource = new HikariDataSource(config);
        LOG.info("MetadataService initialized with database: {}:{}/{}", dbHost, dbPort, dbName);
    }

    public DataSourceMetadata loadMetadata(String metadataKey) throws Exception {
        if (cache.containsKey(metadataKey)) {
            LOG.debug("Returning cached metadata for key: {}", metadataKey);
            return cache.get(metadataKey);
        }

        String query = "SELECT id, name, description, source_fields, sink_fields, validations, " +
                "sink_hdfs_path, kafka_topic_pattern, kafka_starting_offset, kafka_cdp_metadata_topic_prefix, " +
                "kafka_cdp_metadata_topic_field, is_active, " +
                "file_download_enabled, file_field_config FROM data_source_metadata " +
                "WHERE id::text = ? OR name = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, metadataKey);
            stmt.setString(2, metadataKey);

            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    throw new RuntimeException("Data source metadata not found: " + metadataKey);
                }

                DataSourceMetadata metadata = new DataSourceMetadata();
                metadata.setId(rs.getString("id"));
                metadata.setName(rs.getString("name"));
                metadata.setDescription(rs.getString("description"));

                byte[] sourceFieldsJson = rs.getBytes("source_fields");
                metadata.setSourceFields(mapper.readValue(sourceFieldsJson, mapper.getTypeFactory()
                        .constructCollectionType(java.util.List.class, SourceField.class)));

                byte[] sinkFieldsJson = rs.getBytes("sink_fields");
                metadata.setSinkFields(mapper.readValue(sinkFieldsJson, mapper.getTypeFactory()
                        .constructCollectionType(java.util.List.class, SinkField.class)));

                byte[] validationsJson = rs.getBytes("validations");
                if (validationsJson != null) {
                    metadata.setValidations(mapper.readValue(validationsJson, mapper.getTypeFactory()
                            .constructCollectionType(java.util.List.class, ValidationRule.class)));
                }

                metadata.setSinkHdfsPath(rs.getString("sink_hdfs_path"));
                metadata.setKafkaTopicPattern(rs.getString("kafka_topic_pattern"));
                metadata.setKafkaStartingOffset(rs.getString("kafka_starting_offset"));
                metadata.setKafkaCdpMetadataTopicPrefix(rs.getString("kafka_cdp_metadata_topic_prefix"));
                metadata.setKafkaCdpMetadataTopicField(rs.getString("kafka_cdp_metadata_topic_field"));
                metadata.setActive(rs.getBoolean("is_active"));
                metadata.setFileDownloadEnabled(rs.getBoolean("file_download_enabled"));

                if (!metadata.isActive()) {
                    throw new RuntimeException("Data source metadata is inactive: " + metadataKey);
                }

                byte[] fileFieldConfigJson = rs.getBytes("file_field_config");
                if (fileFieldConfigJson != null) {
                    metadata.setFileFieldConfig(mapper.readValue(fileFieldConfigJson, FileFieldConfig.class));
                } else {
                    metadata.setFileFieldConfig(new FileFieldConfig());
                }

                cache.put(metadataKey, metadata);
                cache.put(metadata.getId(), metadata);
                cache.put(metadata.getName(), metadata);
                LOG.info("Loaded metadata: {} ({}) by key={}", metadata.getName(), metadata.getId(), metadataKey);
                return metadata;
            }
        }
    }

    public void close() {
        if (dataSource != null && !dataSource.isClosed()) {
            dataSource.close();
            LOG.info("MetadataService closed");
        }
    }
}
