package com.example.pafbackend.models;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "notifications")
@Getter
@Setter
public class Notification {
    @Id
    private String id;
    private String userId;
    private String message;
    private String type; // "like", "comment", "group_invite", etc.
    private String sourceId; // ID of the related post, comment, group, etc.
    private String sourceType; // "post", "comment", "group", etc.
    private String actionUserId; // ID of the user who triggered the notification
    private Date timestamp;
    private boolean read;

    public Notification() {
        this.timestamp = new Date();
        this.read = false;
    }
}