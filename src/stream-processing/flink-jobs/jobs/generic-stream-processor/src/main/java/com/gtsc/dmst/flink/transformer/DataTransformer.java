package com.gtsc.dmst.flink.transformer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.gtsc.dmst.flink.metadata.DataSourceMetadata;
import com.gtsc.dmst.flink.metadata.SinkField;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.Serializable;

public class DataTransformer implements Serializable {
    private static final long serialVersionUID = 1L;
    private static final Logger LOG = LoggerFactory.getLogger(DataTransformer.class);
    private static final ObjectMapper mapper = new ObjectMapper();
    private final DataSourceMetadata metadata;

    public DataTransformer(DataSourceMetadata metadata) {
        this.metadata = metadata;
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

    public String transform(String jsonMessage) {
        try {
            JsonNode sourceNode = mapper.readTree(jsonMessage);
            ObjectNode sinkNode = mapper.createObjectNode();

            for (SinkField mapping : metadata.getSinkFields()) {
                JsonNode sourceValue = getNestedNode(sourceNode, mapping.getSourceName());

                if (sourceValue == null || sourceValue.isNull()) {
                    sinkNode.putNull(mapping.getSinkName());
                } else if (mapping.getTransform() != null && !mapping.getTransform().isEmpty()) {
                    sinkNode.set(mapping.getSinkName(), applyTransform(sourceValue, mapping.getTransform()));
                } else {
                    sinkNode.set(mapping.getSinkName(), sourceValue);
                }
            }

            return mapper.writeValueAsString(sinkNode);
        } catch (Exception e) {
            LOG.error("Error transforming message: {}", jsonMessage, e);
            throw new RuntimeException("Transformation failed", e);
        }
    }

    private JsonNode applyTransform(JsonNode value, String transform) {
        if (transform == null || transform.isEmpty()) {
            return value;
        }

        String[] parts = transform.split(":");
        String transformType = parts[0].toLowerCase();

        switch (transformType) {
            case "upper":
                return mapper.valueToTree(value.asText().toUpperCase());
            case "lower":
                return mapper.valueToTree(value.asText().toLowerCase());
            case "trim":
                return mapper.valueToTree(value.asText().trim());
            case "length":
                return mapper.valueToTree(value.asText().length());
            case "replace":
                if (parts.length >= 3) {
                    String from = parts[1];
                    String to = parts[2];
                    return mapper.valueToTree(value.asText().replace(from, to));
                }
                return value;
            case "substring":
                if (parts.length >= 3) {
                    int start = Integer.parseInt(parts[1]);
                    int end = Integer.parseInt(parts[2]);
                    String text = value.asText();
                    return mapper.valueToTree(text.substring(start, Math.min(end, text.length())));
                }
                return value;
            case "prefix":
                if (parts.length >= 2) {
                    String prefix = parts[1];
                    return mapper.valueToTree(prefix + value.asText());
                }
                return value;
            case "suffix":
                if (parts.length >= 2) {
                    String suffix = parts[1];
                    return mapper.valueToTree(value.asText() + suffix);
                }
                return value;
            default:
                LOG.warn("Unknown transform type: {}", transformType);
                return value;
        }
    }
}
