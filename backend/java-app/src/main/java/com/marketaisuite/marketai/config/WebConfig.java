package com.marketaisuite.marketai.config;

import com.marketaisuite.marketai.web.LoginInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final LoginInterceptor loginInterceptor;

    public WebConfig(LoginInterceptor loginInterceptor) {
        this.loginInterceptor = loginInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry
                .addInterceptor(loginInterceptor)
                .addPathPatterns(
                        "/api/dashboard",
                        "/generate-campaign",
                        "/generate-pitch",
                        "/score-lead",
                        "/connect_social",
                        "/get_social",
                        "/chatbot/*",
                        "/api/analytics");
    }
}
