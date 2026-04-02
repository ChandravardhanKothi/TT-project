package com.marketaisuite.marketai.domain;

import java.util.List;

public record UserStats(
        int totalGenerations,
        int campaigns,
        int pitches,
        int leads,
        List<GenerationActivity> recentActivity) {}
