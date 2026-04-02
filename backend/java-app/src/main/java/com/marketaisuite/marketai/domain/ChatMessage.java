package com.marketaisuite.marketai.domain;

import java.util.Map;

public record ChatMessage(String role, String message, String timestamp) {

    public static ChatMessage fromRow(Map<String, Object> row) {
        return new ChatMessage(
                str(row.get("role")),
                str(row.get("message")),
                str(row.get("timestamp")));
    }

    private static String str(Object o) {
        return o == null ? "" : o.toString();
    }
}
