import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Button, Alert, ProgressBar } from 'react-bootstrap';
import { FaImage, FaVideo, FaYoutube, FaTimes, FaInfoCircle, FaUpload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { mediaService } from '../api/apiService';
import { AuthContext } from '../context/AuthContext';

const MediaUpload = ({ onChange, maxItems = 3, initialItems = [] }) => {
  const { currentUser } = React.useContext(AuthContext);
  const [mediaItems, setMediaItems] = useState([]);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const youtubeInputRef = useRef(null);
  
  // Initialize with initial items if provided
  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setMediaItems(initialItems);
    }
  }, [initialItems]);
  
  // Call onChange whenever mediaItems changes
  useEffect(() => {
    onChange(mediaItems);
  }, [mediaItems, onChange]);
  
  // Handle file selection and upload
  const handleFileSelect = async (e) => {
    if (mediaItems.length >= maxItems) {
      setError(`Maximum ${maxItems} media items allowed`);
      return;
    }
    
    const file = e.target.files[0];
    if (!file) return;
    
    console.log("Selected file:", file.name, "type:", file.type, "size:", file.size);
    
    // Check file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('Only image and video files are supported');
      return;
    }
    
    // Check video duration if it's a video
    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 30) { // 30 seconds max
          setError('Videos must be 30 seconds or less');
          return;
        }
        // Upload the video if it's within the duration limit
        uploadFile(file);
      };
      
      video.onerror = () => {
        console.error("Error loading video metadata");
        setError('Error loading video. Please try another file.');
      };
      
      video.src = URL.createObjectURL(file);
    } else {
      // Upload image directly
      uploadFile(file);
    }
    
    // Reset the file input
    e.target.value = null;
  };
  
  // Upload file to server using MediaService
  const uploadFile = async (file) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);
      
      console.log("Starting upload for file:", file.name, "size:", file.size, "type:", file.type);
      
      // Upload file to MongoDB via our API
      const response = await mediaService.uploadFile(
        file, 
        currentUser?.id, 
        (progress) => setUploadProgress(progress)
      );
      
      console.log("Upload successful, received data:", response.data);
      
      if (!response.data.url) {
        throw new Error("Server didn't return a valid URL");
      }
      
      // Add uploaded media to the list
      addMediaItem(null, response.data.url, response.data.type, false, response.data.id);
      
      // Show success message
      toast.success('File uploaded successfully!');
      
      setUploading(false);
      setUploadProgress(100);
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(`Failed to upload file: ${error.message}`);
      toast.error('Upload failed. Please try again.');
      setUploading(false);
    }
  };
  
  // Handle YouTube link
  const handleYoutubeLink = async () => {
    if (mediaItems.length >= maxItems) {
      setError(`Maximum ${maxItems} media items allowed`);
      return;
    }
    
    const youtubeUrl = youtubeInputRef.current.value;
    if (!youtubeUrl) return;
    
    // Less strict YouTube URL validation
    if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
      setError('Please enter a valid YouTube URL');
      return;
    }
    
    try {
      setUploading(true);
      
      // Save YouTube URL to MongoDB
      const response = await mediaService.saveExternalMedia({
        url: youtubeUrl,
        contentType: 'video/youtube',
        userId: currentUser?.id
      });
      
      // Add YouTube URL as media item
      addMediaItem(null, response.data.url, 'video/youtube', false, response.data.id);
      youtubeInputRef.current.value = '';
      
      toast.success('YouTube video added');
    } catch (error) {
      console.error('Error saving YouTube URL:', error);
      setError(`Failed to save YouTube URL: ${error.message}`);
      toast.error('Failed to add YouTube video. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  // Add a media item to the list
  const addMediaItem = (file, url, type, blobCreatedByUs = false, id = null) => {
    // Check if the URL already exists to prevent duplicates
    if (mediaItems.some(item => item.url === url)) {
      setError("This media has already been added");
      return;
    }
    
    const newItem = { file, url, type, id: id || Date.now(), mediaId: id, blobCreatedByUs };
    const updatedItems = [...mediaItems, newItem];
    setMediaItems(updatedItems);
    setError(null);
    
    // Call the onChange callback with all media items
    onChange(updatedItems);
  };
  
  // Remove a media item
  const removeMediaItem = (id) => {
    // Find the item to check if it's a blob URL that needs to be revoked
    const itemToRemove = mediaItems.find(item => item.id === id);
    if (itemToRemove && itemToRemove.url && itemToRemove.url.startsWith('blob:') && itemToRemove.blobCreatedByUs) {
      // Revoke the blob URL to prevent memory leaks
      URL.revokeObjectURL(itemToRemove.url);
    }
    
    const updatedItems = mediaItems.filter(item => item.id !== id);
    setMediaItems(updatedItems);
    onChange(updatedItems);
  };
  
  // Helper to get media item preview
  const getMediaPreview = (item) => {
    // For YouTube videos
    if (item.type === 'video/youtube' || item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
      // Extract video ID from YouTube URL
      let videoId = '';
      
      try {
        if (item.url.includes('youtube.com/watch?v=')) {
          videoId = item.url.split('v=')[1];
          // Remove any additional parameters
          const ampersandPosition = videoId.indexOf('&');
          if (ampersandPosition !== -1) {
            videoId = videoId.substring(0, ampersandPosition);
          }
        } else if (item.url.includes('youtu.be/')) {
          videoId = item.url.split('youtu.be/')[1];
          // Remove any additional parameters
          const questionMarkPosition = videoId.indexOf('?');
          if (questionMarkPosition !== -1) {
            videoId = videoId.substring(0, questionMarkPosition);
          }
        }
        
        if (videoId) {
          return (
            <div className="ratio ratio-16x9">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded"
              ></iframe>
            </div>
          );
        } else {
          return <div className="alert alert-warning">Invalid YouTube URL</div>;
        }
      } catch (error) {
        console.error("Error parsing YouTube URL:", error);
        return <div className="alert alert-warning">Error parsing YouTube URL</div>;
      }
    } 
    // For images
    else if (item.type.startsWith('image/') || item.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return (
        <div className="image-preview">
          <img 
            src={item.url} 
            className="img-fluid rounded" 
            alt="Preview" 
            loading="lazy"
            onError={(e) => {
              console.error("Error loading image:", item.url);
              e.target.src = '/images/placeholder-image.png';
            }}
          />
        </div>
      );
    } 
    // For videos
    else if (item.type.startsWith('video/') || item.url.match(/\.(mp4|mov|avi|wmv|webm)$/i)) {
      return (
        <div className="video-preview">
          <video 
            className="w-100 rounded" 
            controls 
            muted 
            playsInline
            preload="metadata"
            onError={(e) => {
              console.error("Error loading video:", item.url);
              e.target.parentElement.innerHTML = '<div class="alert alert-warning">Video could not be loaded</div>';
            }}
          >
            <source src={item.url} type={item.type} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }
    
    return <div className="alert alert-warning">Unsupported media type</div>;
  };
  
  return (
    <div className="media-upload mb-4">
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      
      {/* Media preview */}
      {mediaItems.length > 0 && (
        <Row className="mb-3">
          {mediaItems.map((item) => (
            <Col xs={12} md={4} key={item.id} className="mb-3">
              <div className="position-relative">
                {getMediaPreview(item)}
                <Button
                  variant="danger"
                  size="sm"
                  className="position-absolute top-0 end-0 m-2"
                  onClick={() => removeMediaItem(item.id)}
                >
                  <FaTimes />
                </Button>
              </div>
            </Col>
          ))}
        </Row>
      )}
      
      {/* Upload controls */}
      {mediaItems.length < maxItems && (
        <Row className="g-2">
          <Col>
            <Button
              variant="outline-primary"
              onClick={() => fileInputRef.current.click()}
              className="w-100"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <FaUpload className="me-2" /> Uploading...
                </>
              ) : (
                <>
                  <FaImage className="me-2" /> Add Photo/Video
                </>
              )}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,video/*"
              style={{ display: 'none' }}
            />
          </Col>
          
          <Col>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="YouTube URL"
                ref={youtubeInputRef}
              />
              <Button 
                variant="outline-secondary" 
                onClick={handleYoutubeLink}
                disabled={uploading}
              >
                <FaYoutube /> Add
              </Button>
            </div>
          </Col>
        </Row>
      )}
      
      {uploading && (
        <ProgressBar animated now={uploadProgress} className="mt-3" />
      )}
      
      <div className="mt-2 text-muted small">
        <FaInfoCircle className="me-1" /> 
        Add up to {maxItems} photos or videos. Videos must be 30 seconds or less. No file size limit.
      </div>
    </div>
  );
};

export default MediaUpload;