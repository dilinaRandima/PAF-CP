package com.example.pafbackend.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "bookmarks")
@Getter
@Setter
public class Bookmark {
    @Id
    private String id;
    private String userId;
    private String resourceId; // Can be postId or external URL
    private String resourceType; // "post", "external", etc.
    private String title;
    private String note;
    private String[] tags;
    private Date createdAt;
    
    public Bookmark() {
        this.createdAt = new Date();
    }
}