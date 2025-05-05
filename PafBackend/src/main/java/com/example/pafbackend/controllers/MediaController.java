package com.example.pafbackend.controllers;

import com.example.pafbackend.models.Media;
import com.example.pafbackend.repositories.MediaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final MediaRepository mediaRepository;

    @Autowired
    public MediaController(MediaRepository mediaRepository) {
        this.mediaRepository = mediaRepository;
    }

    @GetMapping("/{postId}")
    public ResponseEntity<List<Media>> getMediaByPostId(@PathVariable String postId) {
        List<Media> mediaList = mediaRepository.findByPostId(postId);
        return new ResponseEntity<>(mediaList, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Media> createMedia(@RequestBody Media media) {
        Media savedMedia = mediaRepository.save(media);
        return new ResponseEntity<>(savedMedia, HttpStatus.CREATED);
    }

    @DeleteMapping("/{mediaId}")
    public ResponseEntity<Void> deleteMedia(@PathVariable String mediaId) {
        mediaRepository.deleteById(mediaId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
