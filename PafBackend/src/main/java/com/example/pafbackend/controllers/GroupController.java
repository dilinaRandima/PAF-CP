package com.example.pafbackend.controllers;

import com.example.pafbackend.models.Group;
import com.example.pafbackend.repositories.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private GroupRepository groupRepository;

    @GetMapping
    public ResponseEntity<List<Group>> getAllGroups() {
        List<Group> groups = groupRepository.findAll();
        return ResponseEntity.ok(groups);
    }
    
    @GetMapping("/public")
    public ResponseEntity<List<Group>> getPublicGroups() {
        List<Group> groups = groupRepository.findByIsPublicTrue();
        return ResponseEntity.ok(groups);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Group> getGroupById(@PathVariable String id) {
        Optional<Group> group = groupRepository.findById(id);
        return group.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @GetMapping("/creator/{userId}")
    public ResponseEntity<List<Group>> getGroupsByCreator(@PathVariable String userId) {
        List<Group> groups = groupRepository.findByCreatorId(userId);
        return ResponseEntity.ok(groups);
    }
    
    @GetMapping("/member/{userId}")
    public ResponseEntity<List<Group>> getGroupsByMember(@PathVariable String userId) {
        List<Group> groups = groupRepository.findByMemberIdsContaining(userId);
        return ResponseEntity.ok(groups);
    }
    
    @PostMapping
    public ResponseEntity<Group> createGroup(@RequestBody Group group) {
        group.setCreatedAt(new Date());
        
        // Add creator to members and admins lists
        if (!group.getMemberIds().contains(group.getCreatorId())) {
            group.getMemberIds().add(group.getCreatorId());
        }
        
        if (!group.getAdminIds().contains(group.getCreatorId())) {
            group.getAdminIds().add(group.getCreatorId());
        }
        
        Group savedGroup = groupRepository.save(group);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedGroup);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Group> updateGroup(@PathVariable String id, @RequestBody Group groupDetails) {
        return groupRepository.findById(id)
                .map(group -> {
                    group.setName(groupDetails.getName());
                    group.setDescription(groupDetails.getDescription());
                    group.setImageUrl(groupDetails.getImageUrl());
                    group.setTags(groupDetails.getTags());
                    group.setRules(groupDetails.getRules());
                    group.setPublic(groupDetails.isPublic());
                    
                    Group updatedGroup = groupRepository.save(group);
                    return ResponseEntity.ok(updatedGroup);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}/members")
    public ResponseEntity<Group> updateGroupMembers(@PathVariable String id, @RequestBody List<String> memberIds) {
        return groupRepository.findById(id)
                .map(group -> {
                    group.setMemberIds(memberIds);
                    
                    // Ensure creator stays in the members list
                    if (!group.getMemberIds().contains(group.getCreatorId())) {
                        group.getMemberIds().add(group.getCreatorId());
                    }
                    
                    Group updatedGroup = groupRepository.save(group);
                    return ResponseEntity.ok(updatedGroup);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}/admins")
    public ResponseEntity<Group> updateGroupAdmins(@PathVariable String id, @RequestBody List<String> adminIds) {
        return groupRepository.findById(id)
                .map(group -> {
                    group.setAdminIds(adminIds);
                    
                    // Ensure creator stays in the admins list
                    if (!group.getAdminIds().contains(group.getCreatorId())) {
                        group.getAdminIds().add(group.getCreatorId());
                    }
                    
                    Group updatedGroup = groupRepository.save(group);
                    return ResponseEntity.ok(updatedGroup);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable String id) {
        return groupRepository.findById(id)
                .map(group -> {
                    groupRepository.delete(group);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}