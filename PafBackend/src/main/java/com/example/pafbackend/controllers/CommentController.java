package com.example.pafbackend.controllers;

import com.example.pafbackend.models.Comment;
import com.example.pafbackend.repositories.CommentRepository;
import com.example.pafbackend.repositories.PostRepository;
import com.example.pafbackend.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:3000")
public class CommentController {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public CommentController(CommentRepository commentRepository, PostRepository postRepository, UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    // Create comment
    @PostMapping("/{postId}")
    public ResponseEntity<Comment> createComment(@PathVariable String postId, @RequestBody Comment comment) {
        if (!postRepository.existsById(postId)) {
            return ResponseEntity.notFound().build();
        }
        if (!userRepository.existsById(comment.getUserId())) {
            return ResponseEntity.notFound().build();
        }
        comment.setPostId(postId);
        return ResponseEntity.ok(commentRepository.save(comment));
    }

    // Get all comments for a post
    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Comment>> getCommentsByPost(@PathVariable String postId) {
        if (!postRepository.existsById(postId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(commentRepository.findByPostId(postId));
    }

    // Update a comment
    @PutMapping("/{id}")
    public ResponseEntity<Comment> updateComment(@PathVariable String id, @RequestBody Comment updatedComment) {
        Optional<Comment> existingComment = commentRepository.findById(id);

        if (existingComment.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Comment comment = existingComment.get();
        comment.setCommentText(updatedComment.getCommentText());
        Comment saved = commentRepository.save(comment);
        return ResponseEntity.ok(saved);
    }

    // Delete a comment
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable String id) {
        if (!commentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        commentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
