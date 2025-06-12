package com.example.pafbackend.repositories;

import com.example.pafbackend.models.MediaModel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MediaRepository extends MongoRepository<MediaModel, String> {
    List<MediaModel> findByPostId(String postId);
    List<MediaModel> findByUploadedBy(String userId);
}