package com.example.pafbackend.config;

import com.example.pafbackend.models.User;
import com.example.pafbackend.repositories.UserRepository;
import com.example.pafbackend.dto.TokenDTO;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class GoogleOAuthSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final TokenGenerator tokenGenerator;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                      Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oauth2User = oauthToken.getPrincipal();
        Map<String, Object> attributes = oauth2User.getAttributes();
        
        String email = (String) attributes.get("email");
        
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setRole("USER");
                    newUser.setCreatedAt(new java.util.Date());
                    return userRepository.save(newUser);
                });
        
        // Create authentication token
        Authentication userAuth = new UsernamePasswordAuthenticationToken(
            user,
            null,
            user.getAuthorities()
        );
        
        // Generate tokens
        TokenDTO tokens = tokenGenerator.createToken(userAuth, List.copyOf(user.getAuthorities()));
        
        // Redirect with tokens
        String redirectUrl = "http://localhost:3000/oauth-callback" +
                "?token=" + tokens.getAccessToken() +
                "&refreshToken=" + tokens.getRefreshToken() +
                "&userId=" + tokens.getUserId();
        
        response.sendRedirect(redirectUrl);
    }
}