package com.gtsc.dmst.flink.metadata;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.gtsc.dmst.flink.file.FileFieldConfig;
import java.io.Serializable;
import java.util.List;

public class DataSourceMetadata implements Serializable {
    private static final long serialVersionUID = 1L;

    @JsonProperty("id")
    private String id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("description")
    private String description;

    @JsonProperty("sourceFields")
    private List<SourceField> sourceFields;

    @JsonProperty("sinkFields")
    private List<SinkField> sinkFields;

    @JsonProperty("validations")
    private List<ValidationRule> validations;

    @JsonProperty("sinkHdfsPath")
    private String sinkHdfsPath;

    @JsonProperty("kafkaTopicPattern")
    private String kafkaTopicPattern;

    @JsonProperty("kafkaStartingOffset")
    private String kafkaStartingOffset;

    @JsonProperty("kafkaCdpMetadataTopicPrefix")
    private String kafkaCdpMetadataTopicPrefix;

    @JsonProperty("kafkaCdpMetadataTopicField")
    private String kafkaCdpMetadataTopicField;

    @JsonProperty("isActive")
    private boolean isActive;

    @JsonProperty("fileDownloadEnabled")
    private boolean fileDownloadEnabled;

    @JsonProperty("fileFieldConfig")
    private FileFieldConfig fileFieldConfig;

    @JsonProperty("resultTopic")
    private String resultTopic;

    public DataSourceMetadata() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<SourceField> getSourceFields() {
        return sourceFields;
    }

    public void setSourceFields(List<SourceField> sourceFields) {
        this.sourceFields = sourceFields;
    }

    public List<SinkField> getSinkFields() {
        return sinkFields;
    }

    public void setSinkFields(List<SinkField> sinkFields) {
        this.sinkFields = sinkFields;
    }

    public List<ValidationRule> getValidations() {
        return validations;
    }

    public void setValidations(List<ValidationRule> validations) {
        this.validations = validations;
    }

    public String getSinkHdfsPath() {
        return sinkHdfsPath;
    }

    public void setSinkHdfsPath(String sinkHdfsPath) {
        this.sinkHdfsPath = sinkHdfsPath;
    }

    public String getKafkaTopicPattern() {
        return kafkaTopicPattern;
    }

    public void setKafkaTopicPattern(String kafkaTopicPattern) {
        this.kafkaTopicPattern = kafkaTopicPattern;
    }

    public String getKafkaStartingOffset() {
        return kafkaStartingOffset;
    }

    public void setKafkaStartingOffset(String kafkaStartingOffset) {
        this.kafkaStartingOffset = kafkaStartingOffset;
    }

    public String getKafkaCdpMetadataTopicPrefix() {
        return kafkaCdpMetadataTopicPrefix;
    }

    public void setKafkaCdpMetadataTopicPrefix(String kafkaCdpMetadataTopicPrefix) {
        this.kafkaCdpMetadataTopicPrefix = kafkaCdpMetadataTopicPrefix;
    }

    public String getKafkaCdpMetadataTopicField() {
        return kafkaCdpMetadataTopicField;
    }

    public void setKafkaCdpMetadataTopicField(String kafkaCdpMetadataTopicField) {
        this.kafkaCdpMetadataTopicField = kafkaCdpMetadataTopicField;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public boolean isFileDownloadEnabled() {
        return fileDownloadEnabled;
    }

    public void setFileDownloadEnabled(boolean fileDownloadEnabled) {
        this.fileDownloadEnabled = fileDownloadEnabled;
    }

    public FileFieldConfig getFileFieldConfig() {
        return fileFieldConfig;
    }

    public void setFileFieldConfig(FileFieldConfig fileFieldConfig) {
        this.fileFieldConfig = fileFieldConfig;
    }

    @Override
    public String toString() {
        return "DataSourceMetadata{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", sinkHdfsPath='" + sinkHdfsPath + '\'' +
                ", kafkaTopicPattern='" + kafkaTopicPattern + '\'' +
                ", kafkaStartingOffset='" + kafkaStartingOffset + '\'' +
                ", kafkaCdpMetadataTopicPrefix='" + kafkaCdpMetadataTopicPrefix + '\'' +
                ", kafkaCdpMetadataTopicField='" + kafkaCdpMetadataTopicField + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}
