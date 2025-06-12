package com.example.pafbackend.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class GoogleOAuthSuccessHandler implements AuthenticationSuccessHandler {
    // No-arg constructor is sufficient for AuthenticationSuccessHandler

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        // Custom logic after successful Google OAuth2 login
        response.sendRedirect("http://localhost:3000"); // Redirect to frontend after login
    }
}
