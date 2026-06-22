package com.gtsc.dmst.flink.validator;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gtsc.dmst.flink.metadata.DataSourceMetadata;
import com.gtsc.dmst.flink.metadata.SourceField;
import com.gtsc.dmst.flink.metadata.ValidationRule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.Serializable;
import java.util.List;
import java.util.regex.Pattern;

public class SchemaValidator implements Serializable {
    private static final long serialVersionUID = 1L;
    private static final Logger LOG = LoggerFactory.getLogger(SchemaValidator.class);
    private static final ObjectMapper mapper = new ObjectMapper();
    private final DataSourceMetadata metadata;

    public SchemaValidator(DataSourceMetadata metadata) {
        this.metadata = metadata;
    }

    // Returns null if valid, or the failed field name/reason if invalid
    public String validateWithReason(String jsonMessage) {
        try {
            JsonNode node = mapper.readTree(jsonMessage);
            for (SourceField field : metadata.getSourceFields()) {
                if (!validateField(node, field)) {
                    return field.getName();
                }
            }
            if (metadata.getValidations() != null) {
                for (ValidationRule rule : metadata.getValidations()) {
                    if (!applyValidationRule(node, rule)) {
                        return rule.getFieldName() + ":" + rule.getRuleType();
                    }
                }
            }
            return null;
        } catch (Exception e) {
            return "parse_error:" + e.getMessage();
        }
    }

    public boolean validate(String jsonMessage) {
        try {
            JsonNode node = mapper.readTree(jsonMessage);

            for (SourceField field : metadata.getSourceFields()) {
                if (!validateField(node, field)) {
                    LOG.warn("Validation failed for field: {} in message: {}", field.getName(), jsonMessage);
                    return false;
                }
            }

            if (metadata.getValidations() != null && !metadata.getValidations().isEmpty()) {
                for (ValidationRule rule : metadata.getValidations()) {
                    if (!applyValidationRule(node, rule)) {
                        LOG.warn("Rule validation failed for field: {} (rule: {})",
                                rule.getFieldName(), rule.getRuleType());
                        return false;
                    }
                }
            }

            return true;
        } catch (Exception e) {
            LOG.error("Error validating message: {}", jsonMessage, e);
            return false;
        }
    }

    private JsonNode getNestedNode(JsonNode root, String path) {
        JsonNode current = root;
        for (String part : path.split("\\.")) {
            if (current == null || current.isNull() || !current.isObject()) return null;
            JsonNode next = current.get(part);
            if (next == null) {
                next = findFieldIgnoreCase(current, part);
            }
            current = next;
        }
        return current;
    }

    private JsonNode findFieldIgnoreCase(JsonNode node, String fieldName) {
        if (node == null || !node.isObject()) return null;
        String lower = fieldName.toLowerCase();
        java.util.Iterator<String> names = node.fieldNames();
        while (names.hasNext()) {
            String name = names.next();
            if (name.toLowerCase().equals(lower)) {
                return node.get(name);
            }
        }
        return null;
    }

    private boolean validateField(JsonNode node, SourceField field) {
        JsonNode fieldNode = getNestedNode(node, field.getName());

        if (fieldNode == null || fieldNode.isNull()) {
            if (field.isRequired()) {
                LOG.warn("Required field missing: {}", field.getName());
                return false;
            }
            return true;
        }

        return validateFieldType(fieldNode, field.getType());
    }

    private boolean validateFieldType(JsonNode node, String type) {
        switch (type.toLowerCase()) {
            case "string":
                return node.isTextual();
            case "int":
            case "integer":
                return node.isInt();
            case "long":
                return node.isLong() || node.isInt();
            case "double":
            case "float":
                return node.isDouble() || node.isInt() || node.isLong();
            case "boolean":
                return node.isBoolean();
            case "date":
                return node.isTextual(); // assume ISO format
            default:
                return true;
        }
    }

    private boolean applyValidationRule(JsonNode node, ValidationRule rule) {
        String ruleType = rule.getRuleType().toLowerCase();
        String ruleValue = rule.getRuleValue();
        JsonNode fieldNode = getNestedNode(node, rule.getFieldName());

        if (fieldNode == null || fieldNode.isNull()) {
            return !"required".equals(ruleType);
        }

        switch (ruleType) {
            case "required":
                return !fieldNode.isNull();
            case "pattern":
                return Pattern.matches(ruleValue, fieldNode.asText());
            case "minlength":
                return fieldNode.asText().length() >= Integer.parseInt(ruleValue);
            case "maxlength":
                return fieldNode.asText().length() <= Integer.parseInt(ruleValue);
            case "enum":
                String[] values = ruleValue.split(",");
                String nodeValue = fieldNode.asText();
                for (String v : values) {
                    if (v.trim().equals(nodeValue)) {
                        return true;
                    }
                }
                return false;
            case "range":
                String[] parts = ruleValue.split("-");
                if (parts.length == 2) {
                    double min = Double.parseDouble(parts[0]);
                    double max = Double.parseDouble(parts[1]);
                    double value = fieldNode.asDouble();
                    return value >= min && value <= max;
                }
                return false;
            default:
                return true;
        }
    }
}
