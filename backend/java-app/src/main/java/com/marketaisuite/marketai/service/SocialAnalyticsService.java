package com.marketaisuite.marketai.service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.stereotype.Service;

/**
 * Demo-style social analytics. In this Java version we stub realistic values when live scraping is unavailable.
 */
@Service
public class SocialAnalyticsService {

    public Map<String, Object> getInstagramAnalytics(String username) {
        if (username == null || username.isBlank()) {
            return null;
        }
        String u = username.trim();
        ThreadLocalRandom r = ThreadLocalRandom.current();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("followers", r.nextInt(5000, 50001));
        m.put("posts", r.nextInt(50, 501));
        m.put("bio", "Profile information (demo / simulated)");
        m.put("username", u.replace("@", ""));
        m.put("full_name", u);
        m.put("is_private", false);
        m.put("growth", round1(r.nextDouble(5, 25)));
        return m;
    }

    public Map<String, Object> getTwitterAnalytics(String username) {
        if (username == null || username.isBlank()) {
            return null;
        }
        String u = username.trim();
        ThreadLocalRandom r = ThreadLocalRandom.current();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("followers", r.nextInt(2000, 30001));
        m.put("tweets", r.nextInt(100, 1001));
        m.put("username", u.replace("@", ""));
        m.put("display_name", u);
        m.put("verified", false);
        m.put("growth", round1(r.nextDouble(2, 20)));
        return m;
    }

    public Map<String, Object> getLinkedinAnalytics(String username) {
        if (username == null || username.isBlank()) {
            return null;
        }
        String u = username.trim();
        ThreadLocalRandom r = ThreadLocalRandom.current();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("followers", r.nextInt(1000, 20001));
        m.put("posts", r.nextInt(20, 201));
        m.put("username", u);
        m.put("growth", round1(r.nextDouble(3, 15)));
        m.put("connections", r.nextInt(500, 10001));
        return m;
    }

    private static double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}
