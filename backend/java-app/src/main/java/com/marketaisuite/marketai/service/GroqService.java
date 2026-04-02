package com.marketaisuite.marketai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GroqService {

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String MODEL = "llama-3.3-70b-versatile";

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public GroqService(
            ObjectMapper objectMapper,
            @Value("${groq.api-key:}") String apiKey) {
        this.objectMapper = objectMapper;
        String key = apiKey != null ? apiKey.trim() : "";
        // Users often paste keys wrapped in quotes, e.g. "gsk_...."
        // Strip common surrounding quotes to avoid auth failures.
        if ((key.startsWith("\"") && key.endsWith("\"")) || (key.startsWith("'") && key.endsWith("'"))) {
            key = key.substring(1, key.length() - 1).trim();
        }
        // Also handle accidental "Bearer <key>" being pasted into the env var.
        if (key.toLowerCase().startsWith("bearer ")) {
            key = key.substring("bearer ".length()).trim();
        }
        this.apiKey = key;
        this.httpClient =
                HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(30)).build();
        if (this.apiKey.isEmpty()) {
            throw new IllegalStateException(
                    "GROQ_API_KEY is not set. Set environment variable GROQ_API_KEY or groq.api-key in application.properties.");
        }
    }

    public String chat(List<Map<String, String>> messages, int maxTokens, double temperature) {
        try {
            ObjectNode body = objectMapper.createObjectNode();
            body.put("model", MODEL);
            body.put("temperature", temperature);
            body.put("top_p", 1);
            body.put("max_tokens", maxTokens);
            body.put("stream", false);
            ArrayNode arr = body.putArray("messages");
            for (Map<String, String> m : messages) {
                ObjectNode msg = arr.addObject();
                msg.put("role", m.get("role"));
                msg.put("content", m.get("content"));
            }

            HttpRequest request =
                    HttpRequest.newBuilder()
                            .uri(URI.create(GROQ_URL))
                            .timeout(Duration.ofMinutes(2))
                            .header("Authorization", "Bearer " + apiKey)
                            .header("Content-Type", "application/json")
                            .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                            .build();

            HttpResponse<String> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                return "Error calling Groq API: HTTP "
                        + response.statusCode()
                        + " — "
                        + response.body();
            }
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode content =
                    root.path("choices").path(0).path("message").path("content");
            if (content.isMissingNode() || content.isNull()) {
                return "Error calling Groq API: unexpected response shape";
            }
            return content.asText();
        } catch (Exception e) {
            return "Error calling Groq API: " + e.getMessage();
        }
    }
}
