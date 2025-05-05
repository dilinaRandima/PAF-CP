package com.example.pafbackend.repositories;

import com.example.pafbackend.models.SkillShare;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillShareRepository extends MongoRepository<SkillShare, String> {
    List<SkillShare> findByUserId(String userId);
}
