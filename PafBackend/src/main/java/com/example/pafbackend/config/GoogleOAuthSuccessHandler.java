package com.example.pafbackend.config;

import com.example.pafbackend.models.User;
import com.example.pafbackend.repositories.UserRepository;
import com.example.pafbackend.dto.TokenDTO;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;

@Component
public class GoogleOAuthSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TokenGenerator tokenGenerator;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();
        
        String email = (String) attributes.get("email");
        
        // Check if user exists
        User user = userRepository.findByUsername(email);
        
        if (user == null) {
            // Create new user
            user = new User();
            user.setUsername(email);
            // Use a randomly generated password since they'll login via OAuth
            user.setPassword(java.util.UUID.randomUUID().toString());
            userRepository.save(user);
        }
        
        // Generate tokens
        // This line needed fixing - create a proper Authentication object
        Authentication userAuth = UsernamePasswordAuthenticationToken.authenticated(
            user, 
            null, 
            Collections.emptyList()  // or user.getAuthorities() if you prefer
        );
        
        // Get tokens
        TokenDTO tokens = tokenGenerator.createToken(userAuth);
        
        // Redirect with tokens
        String redirectUrl = "http://localhost:3000/oauth-callback" +
                "?token=" + tokens.getAccessToken() +
                "&refreshToken=" + tokens.getRefreshToken() +
                "&userId=" + tokens.getUserId();
        
        response.sendRedirect(redirectUrl);
    }
}