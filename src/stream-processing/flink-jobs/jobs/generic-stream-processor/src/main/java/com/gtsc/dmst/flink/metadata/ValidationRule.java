package com.gtsc.dmst.flink.metadata;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;

public class ValidationRule implements Serializable {
    private static final long serialVersionUID = 1L;
    @JsonProperty("fieldName")
    private String fieldName;

    @JsonProperty("ruleType")
    private String ruleType; // required, pattern, minLength, maxLength, enum, range

    @JsonProperty("ruleValue")
    private String ruleValue;

    public ValidationRule() {}

    public ValidationRule(String fieldName, String ruleType, String ruleValue) {
        this.fieldName = fieldName;
        this.ruleType = ruleType;
        this.ruleValue = ruleValue;
    }

    public String getFieldName() {
        return fieldName;
    }

    public void setFieldName(String fieldName) {
        this.fieldName = fieldName;
    }

    public String getRuleType() {
        return ruleType;
    }

    public void setRuleType(String ruleType) {
        this.ruleType = ruleType;
    }

    public String getRuleValue() {
        return ruleValue;
    }

    public void setRuleValue(String ruleValue) {
        this.ruleValue = ruleValue;
    }
}
