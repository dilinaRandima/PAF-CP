package com.example.pafbackend.repositories;

import com.example.pafbackend.models.Group;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends MongoRepository<Group, String> {
    List<Group> findByCreatorId(String creatorId);
    List<Group> findByMemberIdsContaining(String userId);
    List<Group> findByIsPublicTrue();
}