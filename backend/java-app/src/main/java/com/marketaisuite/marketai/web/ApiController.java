package com.marketaisuite.marketai.web;

import com.marketaisuite.marketai.domain.ChatMessage;
import com.marketaisuite.marketai.domain.SocialAccounts;
import com.marketaisuite.marketai.domain.UserStats;
import com.marketaisuite.marketai.repository.DatabaseService;
import com.marketaisuite.marketai.service.ChatbotService;
import com.marketaisuite.marketai.service.GroqService;
import com.marketaisuite.marketai.service.MarkdownService;
import com.marketaisuite.marketai.service.SocialAnalyticsService;
import jakarta.servlet.http.HttpSession;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ApiController {

    private static final Pattern SCORE_PATTERN =
            Pattern.compile("(\\d{1,3})\\s*(?:out of 100|/100|score|points)", Pattern.CASE_INSENSITIVE);

    private final DatabaseService databaseService;
    private final GroqService groqService;
    private final MarkdownService markdownService;
    private final SocialAnalyticsService socialAnalyticsService;
    private final ChatbotService chatbotService;

    public ApiController(
            DatabaseService databaseService,
            GroqService groqService,
            MarkdownService markdownService,
            SocialAnalyticsService socialAnalyticsService,
            ChatbotService chatbotService) {
        this.databaseService = databaseService;
        this.groqService = groqService;
        this.markdownService = markdownService;
        this.socialAnalyticsService = socialAnalyticsService;
        this.chatbotService = chatbotService;
    }

    @GetMapping("/api/dashboard")
    public ResponseEntity<?> dashboard(HttpSession session) {
        long userId = userId(session);
        UserStats stats = databaseService.getUserStats(userId);
        SocialAccounts socialAccounts = databaseService.getSocialAccounts(userId);
        List<ChatMessage> recentChats = databaseService.getChatHistory(userId, 5);

        return ResponseEntity.ok(
                Map.of(
                        "userName", session.getAttribute("user_name"),
                        "stats", stats,
                        "socialAccounts", socialAccounts,
                        "recentChats", recentChats));
    }

    @PostMapping("/generate-campaign")
    public ResponseEntity<?> generateCampaign(HttpSession session, @RequestBody Map<String, String> body) {
        long userId = userId(session);
        String product = body.getOrDefault("product", "");
        String audience = body.getOrDefault("audience", "");
        String platform = body.getOrDefault("platform", "");
        if (product.isBlank() || audience.isBlank() || platform.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Product, audience, and platform are required"));
        }

        String prompt =
                """
                Generate a comprehensive marketing campaign strategy for the following:

                Product: %s
                Target Audience: %s
                Platform: %s

                Please provide a detailed marketing campaign strategy that includes:

                ## Campaign Objectives
                2-3 clear, measurable objectives for this campaign

                ## Content Ideas
                5 targeted content ideas specifically tailored to the platform and audience

                ## Ad Copy Variations
                3 different variations of compelling ad copy, each with a different approach (e.g., Problem-Agitate-Solve, Social Proof, Limited-Time Offer)

                ## Call-to-Action (CTA) Suggestions
                3-5 specific CTA suggestions that are tailored to the platform and audience behavior

                Format your response using markdown with clear headings and bullet points. Make the content actionable and specific to the provided product, audience, and platform."""
                        .formatted(product, audience, platform);

        String response = callGroqMarketing(prompt, 2500);
        String html = markdownService.markdownToHtml(response);
        databaseService.logGeneration(userId, "campaign", response);
        return ResponseEntity.ok(Map.of("success", true, "campaign", html));
    }

    @PostMapping("/generate-pitch")
    public ResponseEntity<?> generatePitch(HttpSession session, @RequestBody Map<String, String> body) {
        long userId = userId(session);
        String product = body.getOrDefault("product", "");
        String customer = body.getOrDefault("customer", "");
        if (product.isBlank() || customer.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Product and customer information are required"));
        }

        String prompt =
                """
                Create a personalized, compelling sales pitch for the following:

                Product/Service: %s
                Customer Persona: %s

                Please provide a comprehensive sales pitch that includes:

                ## 30-Second Pitch
                A concise, engaging elevator pitch (approximately 30 seconds when spoken) for initial contact

                ## Value Proposition
                A clear statement of value and business benefits (3-4 key points)

                ## Differentiators
                Key advantages versus competitive alternatives (4-5 specific differentiators that address enterprise pain points)

                ## Call-To-Action
                Next steps to move the deal forward (demo, meeting, trial, etc.) with specific recommendations

                Format your response using markdown with clear headings and bullet points. Make the pitch persuasive, professional, and tailored to the specific customer persona."""
                        .formatted(product, customer);

        String response = callGroqMarketing(prompt, 2000);
        String html = markdownService.markdownToHtml(response);
        databaseService.logGeneration(userId, "pitch", response);
        return ResponseEntity.ok(Map.of("success", true, "pitch", html));
    }

    @PostMapping("/score-lead")
    public ResponseEntity<?> scoreLead(HttpSession session, @RequestBody Map<String, String> body) {
        long userId = userId(session);
        String leadName = body.getOrDefault("leadName", "");
        String budget = body.getOrDefault("budget", "");
        String need = body.getOrDefault("need", "");
        String urgency = body.getOrDefault("urgency", "");
        if (budget.isBlank() || need.isBlank() || urgency.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Budget, need, and urgency are required"));
        }

        String prompt =
                """
                Analyze and score the following lead based on a comprehensive qualification framework:

                Lead Name: %s
                Budget: %s
                Business Need: %s
                Urgency Level: %s

                Evaluate this lead across four key dimensions:
                1. Budget: Available budget and spending authority (0-30 points)
                2. Need: Business pain points and solution fit (0-30 points)
                3. Urgency: Timeline and implementation priority (0-40 points)
                4. Authority: Decision-making power and buying influence (inferred from context, 0-40 points)

                Provide:
                ## Lead Qualification Score
                A numeric score from 0-100
                - 90-100: Hot leads (immediate follow-up)
                - 75-89: Warm leads (priority follow-up)
                - 60-74: Lukewarm leads (nurture)
                - Below 60: Cold leads (defer or disqualify)

                ## Scoring Reasoning
                Detailed explanation of how you calculated the score, breaking down each dimension

                ## Probability of Conversion
                Estimated likelihood of deal closure as a percentage (%)

                Format your response using markdown. Display the score prominently at the beginning, followed by detailed reasoning and conversion probability."""
                        .formatted(leadName, budget, need, urgency);

        String response = callGroqMarketing(prompt, 2000);
        String htmlResponse = markdownService.markdownToHtml(response);
        Integer score = extractScore(htmlResponse);
        if (score == null) {
            score = extractScore(response);
        }
        databaseService.logGeneration(userId, "lead", response);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("success", true);
        out.put("score", score);
        out.put("analysis", htmlResponse);
        return ResponseEntity.ok(out);
    }

    private static Integer extractScore(String text) {
        Matcher m = SCORE_PATTERN.matcher(text);
        if (m.find()) {
            try {
                return Integer.parseInt(m.group(1));
            } catch (NumberFormatException ignored) {
            }
        }
        return null;
    }

    @PostMapping("/connect_social")
    public ResponseEntity<?> connectSocial(HttpSession session, @RequestBody Map<String, String> body) {
        long userId = userId(session);
        String instagram = body.getOrDefault("instagram_username", "").trim();
        String twitter = body.getOrDefault("twitter_username", "").trim();
        String linkedin = body.getOrDefault("linkedin_username", "").trim();
        databaseService.saveSocialAccounts(userId, instagram, twitter, linkedin);
        return ResponseEntity.ok(
                Map.of("success", true, "message", "Social accounts connected successfully"));
    }

    @GetMapping("/get_social")
    public ResponseEntity<?> getSocial(HttpSession session) {
        long userId = userId(session);
        Map<String, Object> accountsMap = databaseService.getSocialAccountsMap(userId);
        if (accountsMap == null) {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("accounts", null);
            body.put("analytics", Map.of());
            return ResponseEntity.ok(body);
        }

        Map<String, Object> analytics = new LinkedHashMap<>();
        String instaUser = str(accountsMap.get("instagram_username"));
        if (!instaUser.isEmpty()) {
            try {
                analytics.put("instagram", socialAnalyticsService.getInstagramAnalytics(instaUser));
            } catch (Exception e) {
                analytics.put("instagram", null);
            }
        }
        String twitterUser = str(accountsMap.get("twitter_username"));
        if (!twitterUser.isEmpty()) {
            try {
                analytics.put("twitter", socialAnalyticsService.getTwitterAnalytics(twitterUser));
            } catch (Exception e) {
                analytics.put("twitter", null);
            }
        }
        String liUser = str(accountsMap.get("linkedin_username"));
        if (!liUser.isEmpty()) {
            try {
                analytics.put("linkedin", socialAnalyticsService.getLinkedinAnalytics(liUser));
            } catch (Exception e) {
                analytics.put("linkedin", null);
            }
        }

        Map<String, Object> filtered = new LinkedHashMap<>();
        for (Map.Entry<String, Object> e : analytics.entrySet()) {
            if (e.getValue() != null) {
                filtered.put(e.getKey(), e.getValue());
            }
        }

        return ResponseEntity.ok(Map.of("accounts", accountsMap, "analytics", filtered));
    }

    @PostMapping("/chatbot/message")
    public ResponseEntity<?> chatbotMessage(HttpSession session, @RequestBody Map<String, String> body) {
        long userId = userId(session);
        String userMessage = body.getOrDefault("message", "").trim();
        if (userMessage.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message is required"));
        }

        List<ChatMessage> chatHistory = databaseService.getChatHistory(userId, 10);
        String aiResponse = chatbotService.getChatbotResponse(userMessage, chatHistory);
        databaseService.saveChatMessage(userId, "user", userMessage);
        databaseService.saveChatMessage(userId, "assistant", aiResponse);
        return ResponseEntity.ok(Map.of("success", true, "response", aiResponse));
    }

    @GetMapping("/chatbot/history")
    public ResponseEntity<?> chatbotHistory(
            HttpSession session, @RequestParam(name = "limit", defaultValue = "50") int limit) {
        long userId = userId(session);
        List<ChatMessage> history = databaseService.getChatHistory(userId, limit);
        List<Map<String, Object>> rows = new ArrayList<>();
        for (ChatMessage m : history) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("role", m.role());
            row.put("message", m.message());
            row.put("timestamp", m.timestamp());
            rows.add(row);
        }
        return ResponseEntity.ok(Map.of("history", rows));
    }

    @GetMapping("/api/analytics")
    public ResponseEntity<?> analytics(HttpSession session) {
        ThreadLocalRandom r = ThreadLocalRandom.current();
        Map<String, Object> platforms = new LinkedHashMap<>();
        platforms.put(
                "instagram",
                Map.of(
                        "followers", r.nextInt(5000, 50001),
                        "engagement_rate", round2(r.nextDouble(2.5, 8.5)),
                        "posts", r.nextInt(50, 501),
                        "growth", round1(r.nextDouble(5, 25))));
        platforms.put(
                "linkedin",
                Map.of(
                        "followers", r.nextInt(1000, 20001),
                        "engagement_rate", round2(r.nextDouble(1.5, 6.0)),
                        "posts", r.nextInt(20, 201),
                        "growth", round1(r.nextDouble(3, 15))));
        platforms.put(
                "twitter",
                Map.of(
                        "followers", r.nextInt(2000, 30001),
                        "engagement_rate", round2(r.nextDouble(1.0, 5.0)),
                        "posts", r.nextInt(100, 1001),
                        "growth", round1(r.nextDouble(2, 20))));

        List<String> dates = new ArrayList<>();
        LocalDate today = LocalDate.now();
        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE;
        for (int i = 30; i >= 0; i--) {
            dates.add(today.minusDays(i).format(fmt));
        }

        Map<String, Object> engagement = new LinkedHashMap<>();
        engagement.put("labels", dates);
        engagement.put("instagram", series(r, dates.size(), 2.5, 8.5));
        engagement.put("linkedin", series(r, dates.size(), 1.5, 6.0));
        engagement.put("twitter", series(r, dates.size(), 1.0, 5.0));

        Map<String, Object> followers = new LinkedHashMap<>();
        followers.put("labels", dates);
        followers.put("instagram", intSeries(r, dates.size(), 5000, 50000));
        followers.put("linkedin", intSeries(r, dates.size(), 1000, 20000));
        followers.put("twitter", intSeries(r, dates.size(), 2000, 30000));

        Map<String, Object> charts = Map.of("engagement", engagement, "followers", followers);
        return ResponseEntity.ok(Map.of("platforms", platforms, "charts", charts));
    }

    private static List<Double> series(ThreadLocalRandom r, int n, double lo, double hi) {
        List<Double> list = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            list.add(round2(r.nextDouble(lo, hi)));
        }
        return list;
    }

    private static List<Integer> intSeries(ThreadLocalRandom r, int n, int lo, int hi) {
        List<Integer> list = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            list.add(r.nextInt(lo, hi + 1));
        }
        return list;
    }

    private static double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    private String callGroqMarketing(String prompt, int maxTokens) {
        List<Map<String, String>> messages =
                List.of(
                        Map.of(
                                "role",
                                "system",
                                "content",
                                "You are an expert marketing and sales strategist with deep knowledge of B2B and B2C sales, marketing campaigns, and lead qualification. Provide detailed, actionable, and professional responses. Format your response using markdown with clear headings, bullet points, and sections."),
                        Map.of("role", "user", "content", prompt));
        return groqService.chat(messages, maxTokens, 0.7);
    }

    private static long userId(HttpSession session) {
        Object id = session.getAttribute("user_id");
        if (id instanceof Number n) {
            return n.longValue();
        }
        throw new IllegalStateException("Not logged in");
    }

    private static String str(Object o) {
        return o == null ? "" : o.toString();
    }
}
