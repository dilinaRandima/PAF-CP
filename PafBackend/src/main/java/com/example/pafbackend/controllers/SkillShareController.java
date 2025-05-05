package com.example.pafbackend.controllers;

import com.example.pafbackend.models.SkillShare;
import com.example.pafbackend.repositories.SkillShareRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/SkillShares")
public class SkillShareController {
    
    private final SkillShareRepository SkillShareRepository;
    
    @Autowired
    public SkillShareController(SkillShareRepository SkillShareRepository) {
        this.SkillShareRepository = SkillShareRepository;
    }
    
    @GetMapping
    public ResponseEntity<List<SkillShare>> getSkillShares() {
        List<SkillShare> SkillShares = SkillShareRepository.findAll();
        return new ResponseEntity<>(SkillShares, HttpStatus.OK);
    }
    
    @GetMapping("/{userId}")
    public ResponseEntity<List<SkillShare>> getSkillSharesByUserId(@PathVariable String userId) {
        List<SkillShare> SkillShares = SkillShareRepository.findByUserId(userId);
        return new ResponseEntity<>(SkillShares, HttpStatus.OK);
    }
    
    @PostMapping
    public ResponseEntity<SkillShare> createSkillShare(@RequestBody SkillShare SkillShare) {
        SkillShare savedSkillShare = SkillShareRepository.save(SkillShare);
        return new ResponseEntity<>(savedSkillShare, HttpStatus.CREATED);
    }
    
    @DeleteMapping("/{SkillShareId}")
    public ResponseEntity<Void> deleteSkillShare(@PathVariable String SkillShareId) {
        SkillShareRepository.deleteById(SkillShareId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    
    @PutMapping("/{SkillShareId}")
    public ResponseEntity<SkillShare> updateSkillShare(@PathVariable String SkillShareId, @RequestBody SkillShare updatedSkillShare) {
        // Check if the Skill Share with the given ID exists
        if (!SkillShareRepository.existsById(SkillShareId)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        // Set the ID of the updated Skill Share
        updatedSkillShare.setId(SkillShareId);
        
        // Update the Skill Share
        SkillShare savedSkillShare = SkillShareRepository.save(updatedSkillShare);
        
        return new ResponseEntity<>(savedSkillShare, HttpStatus.OK);
    }
}