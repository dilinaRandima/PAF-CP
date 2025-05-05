package com.example.pafbackend.controllers;


import com.example.pafbackend.config.TokenGenerator;
import com.example.pafbackend.dto.LoginDTO;
import com.example.pafbackend.dto.SignupDTO;
import com.example.pafbackend.models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    @Autowired
    UserDetailsManager userDetailsManager;

    @Autowired
    TokenGenerator tokenGenerator;

    @Autowired
    DaoAuthenticationProvider daoAuthenticationProvider;

    @PostMapping("/register")
    public ResponseEntity register(@RequestBody SignupDTO signupDTO){
        try {
            User user = new User();
            user.setUsername(signupDTO.getUsername());
            user.setPassword(signupDTO.getPassword());
            userDetailsManager.createUser(user);

            Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(user, signupDTO.getPassword(), Collections.EMPTY_LIST);
            return ResponseEntity.ok(tokenGenerator.createToken(authentication));
        }catch (UsernameNotFoundException ex) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: Username not found!");
        } catch (BadCredentialsException ex) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: Bad credentials!");
        } catch (DataIntegrityViolationException ex) {

            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error: Username may already exist!");
        } catch (Exception ex) {

            return ResponseEntity.internalServerError().body("Error: An unexpected error occurred. Please try again later.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody LoginDTO loginDTO) {
        try {
            logger.info("====== Login method called to "+loginDTO.getUsername());
            try{
                Authentication authentication = daoAuthenticationProvider.authenticate(
                        UsernamePasswordAuthenticationToken.unauthenticated(loginDTO.getUsername(), loginDTO.getPassword())
                );
                return ResponseEntity.ok(tokenGenerator.createToken(authentication));
            }catch (Exception ex) {
                logger.error(ex.getMessage());
                return ResponseEntity.internalServerError().body("Error: An unexpected error occurred. Please try again later.");
            }
        } catch (AuthenticationException ex) {
            throw new BadCredentialsException("Invalid username or password", ex);
        }catch (Exception ex) {
            return ResponseEntity.internalServerError().body("Error: An unexpected error occurred. Please try again later.");
        }
    }
}
