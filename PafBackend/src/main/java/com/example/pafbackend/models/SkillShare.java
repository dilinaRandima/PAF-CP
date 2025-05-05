package com.example.pafbackend.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "SkillShares")
@Getter
@Setter
public class SkillShare {
    @Id
    private String id;
    private String userId;
    private String mealDetails;
    private String dietaryPreferences;
    private List<String> mediaUrls;  // Changed from single mediaUrl to list
    private List<String> mediaTypes; // List to store media types (image/video)
    private String ingredients;
}