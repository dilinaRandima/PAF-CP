package com.example.pafbackend.controllers;

import com.example.pafbackend.models.MediaModel;
import com.example.pafbackend.repositories.MediaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/media")
public class MediaController {

    @Autowired
    private MediaRepository mediaRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // Create directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            // Generate a unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            // Generate URL for the file
            String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/uploads/")
                .path(filename)
                .toUriString();
            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("type", file.getContentType());
            response.put("filename", filename);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Failed to upload file: " + e.getMessage());
        }
    }

    @GetMapping("/api/uploads/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename, @RequestHeader(value = "Range", required = false) String rangeHeader) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
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
        return "application/octet-stream";
    }

    @PostMapping("/external")
    public ResponseEntity<?> saveExternalMedia(@RequestBody Map<String, String> request) {
        try {
            String url = request.get("url");
            String contentType = request.get("contentType");
            String userId = request.get("userId");
            
            if (url == null || url.isEmpty()) {
                return ResponseEntity.badRequest().body("URL is required");
            }
            
            // Create media metadata
            MediaModel mediaModel = new MediaModel();
            mediaModel.setExternalUrl(url);
            mediaModel.setContentType(contentType != null ? contentType : "external/unknown");
            mediaModel.setMediaType("external");
            mediaModel.setUploadDate(new Date());
            mediaModel.setUploadedBy(userId);
            
            // Save metadata
            MediaModel savedMedia = mediaRepository.save(mediaModel);
            
            Map<String, String> response = new HashMap<>();
            response.put("url", url);
            response.put("type", contentType);
            response.put("id", savedMedia.getId());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to save external media: " + e.getMessage());
        }
    }
}