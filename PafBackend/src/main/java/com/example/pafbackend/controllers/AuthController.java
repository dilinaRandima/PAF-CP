package com.example.pafbackend.controllers;

import com.example.pafbackend.dto.LoginRequest;
import com.example.pafbackend.dto.RegisterRequest;
import com.example.pafbackend.dto.TokenDTO;
import com.example.pafbackend.models.User;
import com.example.pafbackend.repositories.UserRepository;
import com.example.pafbackend.config.TokenGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenGenerator tokenGenerator;

    @PostMapping("/register")
    public ResponseEntity<TokenDTO> register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().build();
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        user.setCreatedAt(new java.util.Date());
        userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        List<GrantedAuthority> authorities = new ArrayList<>(user.getAuthorities());
        return ResponseEntity.ok(tokenGenerator.createToken(authentication, authorities));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenDTO> login(@RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = (User) authentication.getPrincipal();
        List<GrantedAuthority> authorities = new ArrayList<>(user.getAuthorities());
        return ResponseEntity.ok(tokenGenerator.createToken(authentication, authorities));
    }
}
