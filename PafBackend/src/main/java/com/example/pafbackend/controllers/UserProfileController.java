package com.example.pafbackend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.pafbackend.models.UserProfile;
import com.example.pafbackend.repositories.UserProfileRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/userProfiles")

public class UserProfileController {

    @Autowired
    private UserProfileRepository userProfileRepository;

    // Create a new UserProfile
    @PostMapping
    public UserProfile createUserProfile(@RequestBody UserProfile userProfile) {
        return userProfileRepository.save(userProfile);
    }

    // Retrieve all UserProfiles
    @GetMapping
    public List<UserProfile> getAllUserProfiles() {
        return userProfileRepository.findAll();
    }

    // Retrieve a UserProfile by ID
    @GetMapping("/{id}")
    public ResponseEntity<UserProfile> getUserProfileById(@PathVariable String id) {
        Optional<UserProfile> userProfile = userProfileRepository.findById(id);
        return userProfile.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public List<UserProfile> getUserProfileByUserId(@PathVariable String userId) {
        return userProfileRepository.findByUserId(userId);
    }

    // Update a UserProfile by ID
    @PutMapping("/{id}")
    public ResponseEntity<UserProfile> updateUserProfile(@PathVariable String id, @RequestBody UserProfile userProfileDetails) {
        return userProfileRepository.findById(id).map(existingUserProfile -> {
            existingUserProfile.setImage(userProfileDetails.getImage());
            existingUserProfile.setBiography(userProfileDetails.getBiography());
            existingUserProfile.setFitnessGoals(userProfileDetails.getFitnessGoals());
            existingUserProfile.setProfileVisibility(userProfileDetails.isProfileVisibility());
            UserProfile updatedUserProfile = userProfileRepository.save(existingUserProfile);
            return ResponseEntity.ok(updatedUserProfile);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete a UserProfile by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserProfile(@PathVariable String id) {
        Optional<UserProfile> userProfile = userProfileRepository.findById(id);
        if (userProfile.isPresent()) {
            userProfileRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
