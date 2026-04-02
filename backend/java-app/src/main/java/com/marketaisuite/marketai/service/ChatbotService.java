package com.marketaisuite.marketai.service;

import com.marketaisuite.marketai.domain.ChatMessage;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class ChatbotService {

    private static final String SYSTEM_PROMPT =
            """
            You are a personal AI marketing assistant helping with social media content, campaigns, branding, and audience growth.

            Provide helpful, actionable advice on:
            - Content ideas and strategies
            - Caption rewrites and optimization
            - Ad copy creation
            - Marketing strategy advice
            - Campaign suggestions
            - Social media best practices
            - Audience engagement tactics

            Be concise, practical, and friendly. Format responses clearly with bullet points or numbered lists when appropriate.""";

    private final GroqService groqService;

    public ChatbotService(GroqService groqService) {
        this.groqService = groqService;
    }

    public String getChatbotResponse(String userMessage, List<ChatMessage> history) {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));

        if (history != null && !history.isEmpty()) {
            List<ChatMessage> tail =
                    history.size() > 10 ? history.subList(history.size() - 10, history.size()) : history;
            for (ChatMessage msg : tail) {
                Map<String, String> pair = new LinkedHashMap<>();
                pair.put("role", msg.role());
                pair.put("content", msg.message());
                messages.add(pair);
            }
        }

        messages.add(Map.of("role", "user", "content", userMessage));
        return groqService.chat(messages, 1500, 0.7);
    }
}
