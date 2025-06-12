package com.example.pafbackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Get absolute path to the upload directory
        String absolutePath = Paths.get(uploadDir).toAbsolutePath().toString();
        
        System.out.println("Configuring resource handler for uploads directory: " + absolutePath);
        
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations("file:" + absolutePath + "/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS));
        
        System.out.println("Resource handler configured successfully");
    }

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        System.out.println("Configuring CORS mappings...");
        
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("*")
                .allowCredentials(true);
                
        System.out.println("CORS mappings configured");
    }
}