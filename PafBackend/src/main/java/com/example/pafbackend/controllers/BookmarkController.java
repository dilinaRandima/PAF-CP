package com.example.pafbackend.controllers;

import com.example.pafbackend.models.Bookmark;
import com.example.pafbackend.repositories.BookmarkRepository;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

/**
 * REST Controller for managing bookmark operations.
 * Implements RESTful principles for bookmark creation, retrieval, update, and deletion.
 * Follows standardized HTTP method usage with appropriate status codes.
 */
@RestController
@RequestMapping("/api/bookmarks")
@CrossOrigin(origins = "http://localhost:3000")
public class BookmarkController {

    private final BookmarkRepository bookmarkRepository;

    public BookmarkController(BookmarkRepository bookmarkRepository) {
        this.bookmarkRepository = bookmarkRepository;
    }

    /**
     * Retrieves all bookmarks for a specific user.
     *
     * @param userId The ID of the user whose bookmarks to retrieve
     * @return ResponseEntity with a list of bookmarks or an empty list
     */
    @GetMapping("/{userId}")
    public ResponseEntity<List<Bookmark>> getUserBookmarks(@PathVariable String userId) {
        List<Bookmark> bookmarks = bookmarkRepository.findByUserId(userId);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.MINUTES))
                .body(bookmarks);
    }

    /**
     * Retrieves all bookmarks for a specific resource.
     *
     * @param resourceId The ID of the resource to find bookmarks for
     * @return ResponseEntity with a list of bookmarks for the resource
     */
    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<List<Bookmark>> getBookmarksByResourceId(@PathVariable String resourceId) {
        List<Bookmark> bookmarks = bookmarkRepository.findByResourceId(resourceId);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.MINUTES))
                .body(bookmarks);
    }

    /**
     * Retrieves all bookmarks with a specific tag.
     *
     * @param tag The tag to search for in bookmarks
     * @return ResponseEntity with a list of bookmarks containing the tag
     */
    @GetMapping("/tags/{tag}")
    public ResponseEntity<List<Bookmark>> getBookmarksByTag(@PathVariable String tag) {
        List<Bookmark> bookmarks = bookmarkRepository.findByTagsContaining(tag);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.MINUTES))
                .body(bookmarks);
    }

    /**
     * Creates a new bookmark.
     * Returns 409 Conflict if the bookmark already exists.
     *
     * @param bookmark The bookmark object to create
     * @return ResponseEntity with the created bookmark and 201 Created status
     */
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

    /**
     * Updates an existing bookmark.
     *
     * @param id The ID of the bookmark to update
     * @param bookmarkDetails The updated bookmark details
     * @return ResponseEntity with the updated bookmark or 404 Not Found
     */
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

    /**
     * Deletes a bookmark by its ID.
     *
     * @param id The ID of the bookmark to delete
     * @return ResponseEntity with 200 OK or 404 Not Found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBookmark(@PathVariable String id) {
        return bookmarkRepository.findById(id)
                .map(bookmark -> {
                    bookmarkRepository.delete(bookmark);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Deletes a bookmark by user ID and resource ID combination.
     *
     * @param userId The ID of the user
     * @param resourceId The ID of the resource
     * @return ResponseEntity with 200 OK or 404 Not Found
     */
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
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkBookmarkExists(
            @RequestParam String userId,
            @RequestParam String resourceId) {

        boolean exists = bookmarkRepository.existsByUserIdAndResourceId(userId, resourceId);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES))
                .body(exists);
    }
}