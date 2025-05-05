package com.example.pafbackend.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.List;
import java.util.ArrayList;

@Getter
@Setter
@Document(collection = "posts")
public class Post {
    @Id
    private String id;
    private String userId;
    private Date timestamp;
    private String title;
    private String contentDescription;
    private List<String> ingredients;
    private String instructions;
    private String cookingTime;
    private String difficultyLevel;
    private String cuisineType;
    
    // Replace single mediaLink/mediaType with lists
    private List<String> mediaLinks = new ArrayList<>();
    private List<String> mediaTypes = new ArrayList<>();
    
    // Keep old fields for backward compatibility
    private String mediaLink;
    private String mediaType;
    
    public Post() {
        this.timestamp = new Date();
    }
}