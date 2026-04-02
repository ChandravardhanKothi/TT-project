package com.marketaisuite.marketai.domain;

import java.util.Map;

public record SocialAccounts(
        String instagramUsername,
        String twitterUsername,
        String linkedinUsername) {

    public boolean anyConnected() {
        return hasText(instagramUsername) || hasText(twitterUsername) || hasText(linkedinUsername);
    }

    private static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

    public static SocialAccounts fromRow(Map<String, Object> row) {
        if (row == null || row.isEmpty()) {
            return null;
        }
        return new SocialAccounts(
                str(row.get("instagram_username")),
                str(row.get("twitter_username")),
                str(row.get("linkedin_username")));
    }

    public Map<String, Object> toAnalyticsResponseMap() {
        return Map.of(
                "instagram_username", instagramUsername != null ? instagramUsername : "",
                "twitter_username", twitterUsername != null ? twitterUsername : "",
                "linkedin_username", linkedinUsername != null ? linkedinUsername : "");
    }

    private static String str(Object o) {
        return o == null ? "" : o.toString();
    }
}
