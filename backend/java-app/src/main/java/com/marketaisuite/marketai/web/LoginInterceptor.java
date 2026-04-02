package com.marketaisuite.marketai.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class LoginInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("user_id") != null) {
            return true;
        }
        response.setStatus(401);
        response.setContentType("application/json");
        response.getWriter().write("{\"success\":false,\"error\":\"Unauthorized\"}");
        return false;
    }
}
