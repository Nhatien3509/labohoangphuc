package com.gtsc.dmst.flink.metadata;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;

public class SinkField implements Serializable {
    private static final long serialVersionUID = 1L;
    @JsonProperty("sourceName")
    private String sourceName;

    @JsonProperty("sinkName")
    private String sinkName;

    @JsonProperty("transform")
    private String transform;

    @JsonProperty("type")
    private String type = "string";

    public SinkField() {}

    public SinkField(String sourceName, String sinkName) {
        this.sourceName = sourceName;
        this.sinkName = sinkName;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSourceName() {
        return sourceName;
    }

    public void setSourceName(String sourceName) {
        this.sourceName = sourceName;
    }

    public String getSinkName() {
        return sinkName;
    }

    public void setSinkName(String sinkName) {
        this.sinkName = sinkName;
    }

    public String getTransform() {
        return transform;
    }

    public void setTransform(String transform) {
        this.transform = transform;
    }
}
