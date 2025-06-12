package com.example.pafbackend.models;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@Document(collection = "media_metadata")
public class MediaModel {
    @Id
    private String id;
    private String originalFilename;
    private String contentType;
    private long size;
    private String gridFSId; // For stored files
    private String externalUrl; // For YouTube or other external media
    private String mediaType; // "stored" or "external"
    private Date uploadDate;
    private String uploadedBy;
    private String postId; // Added this field to fix the error
}