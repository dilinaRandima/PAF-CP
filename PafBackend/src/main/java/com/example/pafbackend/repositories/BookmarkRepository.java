package com.example.pafbackend.repositories;

import com.example.pafbackend.models.Bookmark;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends MongoRepository<Bookmark, String> {
    List<Bookmark> findByUserId(String userId);
    List<Bookmark> findByResourceId(String resourceId);
    List<Bookmark> findByTagsContaining(String tag);
    Optional<Bookmark> findByUserIdAndResourceId(String userId, String resourceId);
    boolean existsByUserIdAndResourceId(String userId, String resourceId);
}