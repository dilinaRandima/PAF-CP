package com.example.pafbackend.repositories;

import com.example.pafbackend.models.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findByUserId(String userId);
    // Add this method
List<Post> findByCuisineType(String cuisineType);
}
