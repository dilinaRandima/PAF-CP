package com.example.pafbackend.controllers;

import com.example.pafbackend.models.Like;
import com.example.pafbackend.repositories.LikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/likes")
public class LikeController {

    private final LikeRepository likeRepository;

    @Autowired
    public LikeController(LikeRepository likeRepository) {
        this.likeRepository = likeRepository;
    }

    @GetMapping("/{postId}")
    public ResponseEntity<List<Like>> getLikesByPostId(@PathVariable String postId) {
        List<Like> likes = likeRepository.findByPostId(postId);
        return new ResponseEntity<>(likes, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Like> createLike(@RequestBody Like like) {
        Like savedLike = likeRepository.save(like);
        return new ResponseEntity<>(savedLike, HttpStatus.CREATED);
    }

    @DeleteMapping("/{likeId}")
    public ResponseEntity<Void> deleteLike(@PathVariable String likeId) {
        likeRepository.deleteById(likeId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
