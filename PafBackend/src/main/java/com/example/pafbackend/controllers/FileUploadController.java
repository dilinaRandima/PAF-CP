package com.example.pafbackend.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class FileUploadController {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping("/api/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // Debug log
            System.out.println("=== UPLOAD REQUEST RECEIVED ===");
            System.out.println("Received file: " + file.getOriginalFilename() + " of size: " + file.getSize() + " bytes");
            System.out.println("Content type: " + file.getContentType());
            
            // Create directory if it doesn't exist
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                boolean dirCreated = directory.mkdirs();
                System.out.println("Created directory: " + uploadDir + " result: " + dirCreated);
                if (!dirCreated) {
                    System.err.println("FAILED to create directory: " + directory.getAbsolutePath());
                    return ResponseEntity.status(500).body("Failed to create upload directory");
                }
            }
            
            // Print absolute path for debugging
            System.out.println("Upload directory: " + directory.getAbsolutePath());
            System.out.println("Directory exists: " + directory.exists());
            System.out.println("Directory can write: " + directory.canWrite());

            // Generate a unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;
            
            // Save the file
            Path filePath = Paths.get(directory.getAbsolutePath(), filename);
            System.out.println("Saving file to: " + filePath.toAbsolutePath());
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            System.out.println("File saved successfully");
            
            // Generate URL for the file - Use absolute path for accessing
            String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/uploads/")
                .path(filename)
                .toUriString();
            
            System.out.println("Generated file URL: " + fileUrl);
            
            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("type", file.getContentType());
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            System.err.println("UPLOAD ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to upload file: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("UNEXPECTED ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Unexpected error: " + e.getMessage());
        }
    }

    @GetMapping("/api/uploads/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename, @RequestHeader(value = "Range", required = false) String rangeHeader) {
        try {
            System.out.println("Request to serve file: " + filename);
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            System.out.println("Looking for file at: " + filePath.toAbsolutePath());
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                System.err.println("File not found: " + filePath.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }
            if (!resource.isReadable()) {
                System.err.println("File not readable: " + filePath.toAbsolutePath());
                return ResponseEntity.status(500).body(null);
            }
            String contentType = determineContentType(filename);
            long fileLength = resource.contentLength();
            // Handle Range requests for video streaming
            if (contentType.startsWith("video/") && rangeHeader != null && rangeHeader.startsWith("bytes=")) {
                String[] ranges = rangeHeader.replace("bytes=", "").split("-");
                long start = Long.parseLong(ranges[0]);
                long end = ranges.length > 1 && !ranges[1].isEmpty() ? Long.parseLong(ranges[1]) : fileLength - 1;
                if (end >= fileLength) end = fileLength - 1;
                long contentLength = end - start + 1;
                java.io.InputStream inputStream = resource.getInputStream();
                inputStream.skip(start);
                byte[] data = inputStream.readNBytes((int) contentLength);
                HttpHeaders headers = new HttpHeaders();
                headers.set(HttpHeaders.CONTENT_TYPE, contentType);
                headers.set(HttpHeaders.ACCEPT_RANGES, "bytes");
                headers.set(HttpHeaders.CONTENT_RANGE, String.format("bytes %d-%d/%d", start, end, fileLength));
                headers.setContentLength(contentLength);
                headers.set(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"");
                return ResponseEntity.status(206).headers(headers).body(new org.springframework.core.io.ByteArrayResource(data));
            }
            // Default: return whole file
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
        } catch (Exception e) {
            System.err.println("Error serving file: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    private String determineContentType(String filename) {
        if (filename.toLowerCase().endsWith(".mp4")) {
            return "video/mp4";
        } else if (filename.toLowerCase().endsWith(".webm")) {
            return "video/webm";
        } else if (filename.toLowerCase().endsWith(".mov")) {
            return "video/quicktime";
        } else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (filename.toLowerCase().endsWith(".png")) {
            return "image/png";
        } else if (filename.toLowerCase().endsWith(".gif")) {
            return "image/gif";
        }
        
        // Default content type
        return "application/octet-stream";
    }
    
    // Add a simple test endpoint to verify API connectivity
    @GetMapping("/api/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("API is working correctly!");
    }
}