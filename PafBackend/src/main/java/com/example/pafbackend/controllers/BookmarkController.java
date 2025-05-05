package com.example.pafbackend.controllers;

import com.example.pafbackend.models.Bookmark;
import com.example.pafbackend.repositories.BookmarkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookmarks")
@CrossOrigin(origins = "http://localhost:3000")
public class BookmarkController {

    @Autowired
    private BookmarkRepository bookmarkRepository;

    // Get all user bookmarks
    @GetMapping("/{userId}")
    public ResponseEntity<List<Bookmark>> getUserBookmarks(@PathVariable String userId) {
        List<Bookmark> bookmarks = bookmarkRepository.findByUserId(userId);
        return ResponseEntity.ok(bookmarks);
    }

    // Get bookmarks by resourceId
    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<List<Bookmark>> getBookmarksByResourceId(@PathVariable String resourceId) {
        List<Bookmark> bookmarks = bookmarkRepository.findByResourceId(resourceId);
        return ResponseEntity.ok(bookmarks);
    }

    // Get bookmarks by tag
    @GetMapping("/tags/{tag}")
    public ResponseEntity<List<Bookmark>> getBookmarksByTag(@PathVariable String tag) {
        List<Bookmark> bookmarks = bookmarkRepository.findByTagsContaining(tag);
        return ResponseEntity.ok(bookmarks);
    }

    // Create a new bookmark
    @PostMapping
    public ResponseEntity<Bookmark> createBookmark(@RequestBody Bookmark bookmark) {
        // Check if bookmark already exists
        if (bookmarkRepository.existsByUserIdAndResourceId(bookmark.getUserId(), bookmark.getResourceId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        
        bookmark.setCreatedAt(new Date());
        Bookmark savedBookmark = bookmarkRepository.save(bookmark);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedBookmark);
    }

    // Update a bookmark
    @PutMapping("/{id}")
    public ResponseEntity<Bookmark> updateBookmark(@PathVariable String id, @RequestBody Bookmark bookmarkDetails) {
        return bookmarkRepository.findById(id)
                .map(bookmark -> {
                    bookmark.setTitle(bookmarkDetails.getTitle());
                    bookmark.setNote(bookmarkDetails.getNote());
                    bookmark.setTags(bookmarkDetails.getTags());
                    return ResponseEntity.ok(bookmarkRepository.save(bookmark));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete a bookmark by id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBookmark(@PathVariable String id) {
        return bookmarkRepository.findById(id)
                .map(bookmark -> {
                    bookmarkRepository.delete(bookmark);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete a bookmark by userId and resourceId
    @DeleteMapping("/user/{userId}/resource/{resourceId}")
    public ResponseEntity<Void> deleteBookmarkByUserAndResource(
            @PathVariable String userId,
            @PathVariable String resourceId) {
        
        Optional<Bookmark> bookmark = bookmarkRepository.findByUserIdAndResourceId(userId, resourceId);
        
        return bookmark.map(b -> {
            bookmarkRepository.delete(b);
            return ResponseEntity.ok().<Void>build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Check if a bookmark exists
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkBookmarkExists(
            @RequestParam String userId, 
            @RequestParam String resourceId) {
        
        boolean exists = bookmarkRepository.existsByUserIdAndResourceId(userId, resourceId);
        return ResponseEntity.ok(exists);
    }
}