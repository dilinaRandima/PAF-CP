package com.example.pafbackend.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

@Configuration
public class GridFsConfig {
    
    @Autowired
    private MongoClient mongoClient;
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    @Bean
    public GridFSBucket gridFSBucket() {
        MongoDatabase db = mongoClient.getDatabase(mongoTemplate.getDb().getName());
        return GridFSBuckets.create(db, "mediaFiles");
    }
}