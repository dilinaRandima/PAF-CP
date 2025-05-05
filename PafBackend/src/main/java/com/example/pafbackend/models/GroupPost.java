package com.example.pafbackend.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "groupPosts")
@Getter
@Setter
public class GroupPost {
    @Id
    private String id;
    private String groupId;
    private String userId;
    private String content;
    private Date timestamp;
    private String mediaUrl;
    private String mediaType;
    
    public GroupPost() {
        this.timestamp = new Date();
    }
}