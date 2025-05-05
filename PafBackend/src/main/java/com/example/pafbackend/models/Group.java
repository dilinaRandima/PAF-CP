package com.example.pafbackend.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "groups")
@Getter
@Setter
public class Group {
    @Id
    private String id;
    private String name;
    private String description;
    private String creatorId;
    private Date createdAt;
    private String imageUrl;
    private List<String> tags;
    private List<String> rules;
    private List<String> memberIds = new ArrayList<>();
    private List<String> adminIds = new ArrayList<>();
    private boolean isPublic = true;
    
    public Group() {
        this.createdAt = new Date();
    }
}