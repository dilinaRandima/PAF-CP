package com.example.pafbackend.controllers;

import com.example.pafbackend.models.UserProfile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import com.example.pafbackend.models.User;
import com.example.pafbackend.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
@RestController
@CrossOrigin(origins = "http3000://localhost:")
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Create a new user
    @PostMapping("/create")
    public User createUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    // Retrieve all users
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Retrieve a user by ID
    @GetMapping("/{id}")
    public Optional<User> getUserById(@PathVariable String id) {
        return userRepository.findById(id);
    }



    // Delete a user by ID
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        userRepository.deleteById(id);
    }

    @GetMapping("/exists/{username}")
    public ResponseEntity<Boolean> checkIfUserExists(@PathVariable String username) {
        boolean userExists = userRepository.existsByUsername(username);
        return ResponseEntity.ok(userExists);
    }


}
