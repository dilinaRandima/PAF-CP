package com.example.pafbackend.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "userConnections")
public class UserConnection {
    @Id
    private String id;
    private String userId;
    private List<String> friends; // List of user IDs representing friends

    public List<String> getFriendIds() {
        return friends;
    }

    public void setFriendIds(List<String> friendIds) {
        this.friends = friendIds;
    }
}
