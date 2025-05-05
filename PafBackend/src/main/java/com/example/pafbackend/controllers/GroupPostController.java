package com.example.pafbackend.controllers;

import com.example.pafbackend.models.GroupPost;
import com.example.pafbackend.repositories.GroupPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/group-posts")
public class GroupPostController {

    @Autowired
    private GroupPostRepository groupPostRepository;

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<GroupPost>> getPostsByGroupId(@PathVariable String groupId) {
        List<GroupPost> posts = groupPostRepository.findByGroupIdOrderByTimestampDesc(groupId);
        return ResponseEntity.ok(posts);
    }
    
    @PostMapping
    public ResponseEntity<GroupPost> createPost(@RequestBody GroupPost post) {
        post.setTimestamp(new Date());
        GroupPost savedPost = groupPostRepository.save(post);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPost);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<GroupPost> updatePost(@PathVariable String id, @RequestBody GroupPost postDetails) {
        return groupPostRepository.findById(id)
                .map(post -> {
                    post.setContent(postDetails.getContent());
                    post.setMediaUrl(postDetails.getMediaUrl());
                    post.setMediaType(postDetails.getMediaType());
                    
                    GroupPost updatedPost = groupPostRepository.save(post);
                    return ResponseEntity.ok(updatedPost);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {
        return groupPostRepository.findById(id)
                .map(post -> {
                    groupPostRepository.delete(post);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}