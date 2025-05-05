package com.example.pafbackend.repositories;

import com.example.pafbackend.models.GroupPost;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupPostRepository extends MongoRepository<GroupPost, String> {
    List<GroupPost> findByGroupId(String groupId);
    List<GroupPost> findByGroupIdOrderByTimestampDesc(String groupId);
}