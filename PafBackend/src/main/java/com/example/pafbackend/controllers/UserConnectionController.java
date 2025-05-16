package com.example.pafbackend.controllers;

import com.example.pafbackend.models.UserConnection;
import com.example.pafbackend.repositories.UserConnectionRepository;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * REST Controller for managing user connection operations.
 * Implements RESTful principles for user friendship creation, retrieval, and deletion.
 * Follows standardized HTTP method usage with appropriate status codes.
 */
@RestController
@RequestMapping("/api/userConnections")
public class UserConnectionController {

    private final UserConnectionRepository userConnectionRepository;

    public UserConnectionController(UserConnectionRepository userConnectionRepository) {
        this.userConnectionRepository = userConnectionRepository;
    }

    /**
     * Retrieves user connections for a specific user.
     *
     * @param userId The ID of the user whose connections to retrieve
     * @return ResponseEntity with the user's connections or 404 Not Found
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserConnection> getUserConnections(@PathVariable String userId) {
        UserConnection userConnection = userConnectionRepository.findByUserId(userId);
        if (userConnection != null) {
            return ResponseEntity.ok()
                    .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES))
                    .body(userConnection);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Creates or updates user connections.
     * If a connection document already exists for the user, the new friend IDs are added.
     * If no connection document exists, a new one is created.
     *
     * @param userConnection The user connection object with user ID and friend IDs
     * @return ResponseEntity with the created/updated connection and appropriate status
     */
    @PostMapping
    public ResponseEntity<UserConnection> createUserConnection(@RequestBody UserConnection userConnection) {
        // Check if a document with the userId already exists
        UserConnection existingConnection = userConnectionRepository.findByUserId(userConnection.getUserId());
        if (existingConnection != null) {
            // Update the existing document by adding new friendIds
            List<String> currentFriendIds = existingConnection.getFriendIds();
            List<String> newFriendIds = userConnection.getFriendIds();
            currentFriendIds.addAll(newFriendIds);
            existingConnection.setFriendIds(currentFriendIds);
            UserConnection updatedConnection = userConnectionRepository.save(existingConnection);
            return ResponseEntity.ok(updatedConnection);
        } else {
            // No existing document, create a new one
            UserConnection savedUserConnection = userConnectionRepository.save(userConnection);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUserConnection);
        }
    }

    /**
     * Removes a friend connection between two users.
     * Deletes the specified friend ID from the user's connections.
     *
     * @param userId The ID of the user initiating the unfriend action
     * @param friendId The ID of the friend to remove
     * @return ResponseEntity with 204 No Content or 404 Not Found
     */
    @DeleteMapping("/{userId}/friends/{friendId}")
    public ResponseEntity<Void> unfriend(@PathVariable String userId, @PathVariable String friendId) {
        // Check if a document with the userId exists
        UserConnection existingConnection = userConnectionRepository.findByUserId(userId);
        if (existingConnection != null) {
            // Remove the friendId from the list of friendIds
            List<String> currentFriendIds = existingConnection.getFriendIds();
            currentFriendIds.remove(friendId);
            existingConnection.setFriendIds(currentFriendIds);
            userConnectionRepository.save(existingConnection);
            return ResponseEntity.noContent().build();
        } else {
            // No existing document, return 404
            return ResponseEntity.notFound().build();
        }
    }
}