package com.gtsc.dmst.flink.metadata;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;

public class SourceField implements Serializable {
    private static final long serialVersionUID = 1L;
    @JsonProperty("name")
    private String name;

    @JsonProperty("type")
    private String type; // string, int, long, double, boolean, date

    @JsonProperty("required")
    private boolean required;

    @JsonProperty("description")
    private String description;

    public SourceField() {}

    public SourceField(String name, String type, boolean required) {
        this.name = name;
        this.type = type;
        this.required = required;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isRequired() {
        return required;
    }

    public void setRequired(boolean required) {
        this.required = required;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
