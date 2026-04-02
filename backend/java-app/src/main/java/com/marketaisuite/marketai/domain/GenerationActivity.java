package com.marketaisuite.marketai.domain;

import java.util.Map;

public record GenerationActivity(String type, String createdAt) {

    public static GenerationActivity fromRow(Map<String, Object> row) {
        Object type = row.get("type");
        Object createdAt = row.get("created_at");
        return new GenerationActivity(
                type != null ? type.toString() : "",
                createdAt != null ? createdAt.toString() : "");
    }
}
