package com.example.pafbackend.controllers;

import com.example.pafbackend.models.Post;
import com.example.pafbackend.repositories.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostRepository postRepository;

    @Autowired
    public PostController(PostRepository postRepository) {
        this.postRepository = postRepository;
    }



    @GetMapping
    public ResponseEntity<List<Post>> getPosts() {
        List<Post> posts = postRepository.findAll();
        return new ResponseEntity<>(posts, HttpStatus.OK);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Post>> getPostsByUserId(@PathVariable String userId) {
        List<Post> posts = postRepository.findByUserId(userId);
        return new ResponseEntity<>(posts, HttpStatus.OK);
    }
    // No major changes needed, but you may want to add a method for filtering by cuisine type
@GetMapping("/cuisine/{cuisineType}")
public ResponseEntity<List<Post>> getPostsByCuisineType(@PathVariable String cuisineType) {
    List<Post> posts = postRepository.findByCuisineType(cuisineType);
    return new ResponseEntity<>(posts, HttpStatus.OK);
}

@PostMapping
public ResponseEntity<Post> createPost(@RequestBody Post post) {
    try {
        // Ensure the media arrays exist
        if (post.getMediaLinks() == null) {
            post.setMediaLinks(new ArrayList<>());
        }
        if (post.getMediaTypes() == null) {
            post.setMediaTypes(new ArrayList<>());
        }

        // For backward compatibility, add single media to arrays if they're not already there
        if (post.getMediaLink() != null && !post.getMediaLink().isEmpty() && 
            !post.getMediaLinks().contains(post.getMediaLink())) {
            post.getMediaLinks().add(post.getMediaLink());
            post.getMediaTypes().add(post.getMediaType() != null ? post.getMediaType() : "");
        }
        
        // Log what we're saving
        System.out.println("Saving post with media: " + post.getMediaLinks().size() + " items");
        
        Post savedPost = postRepository.save(post);
        return new ResponseEntity<>(savedPost, HttpStatus.CREATED);
    } catch (Exception e) {
        System.err.println("Error creating post: " + e.getMessage());
        e.printStackTrace();
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR); 
    }
}

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable String postId) {
        postRepository.deleteById(postId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    @PutMapping("/{postId}")
    public ResponseEntity<Post> updatePost(@PathVariable String postId, @RequestBody Post updatedPost) {
        Optional<Post> optionalPost = postRepository.findById(postId);
        if (optionalPost.isPresent()) {
            Post existingPost = optionalPost.get();
            // Update fields if present in the request body
            if (updatedPost.getMediaLink() != null) {
                existingPost.setMediaLink(updatedPost.getMediaLink());
            }
            if (updatedPost.getMediaType() != null) {
                existingPost.setMediaType(updatedPost.getMediaType());
            }
            if (updatedPost.getContentDescription() != null) {
                existingPost.setContentDescription(updatedPost.getContentDescription());
            }
            // Save the updated post
            Post savedPost = postRepository.save(existingPost);
            return new ResponseEntity<>(savedPost, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
