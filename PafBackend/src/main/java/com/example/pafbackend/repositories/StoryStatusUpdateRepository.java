package com.example.pafbackend.repositories;

import com.example.pafbackend.models.StoryStatusUpdate;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoryStatusUpdateRepository extends MongoRepository<StoryStatusUpdate, String> {
    List<StoryStatusUpdate> findByUserId(String userId);
}
