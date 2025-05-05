import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Button, Alert, ProgressBar } from 'react-bootstrap';
import { FaImage, FaVideo, FaYoutube, FaTimes, FaInfoCircle } from 'react-icons/fa';

const MediaUpload = ({ onChange, maxItems = 3 }) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const youtubeInputRef = useRef(null);
  
  // Clean up blob URLs when component unmounts or when media items change
  useEffect(() => {
    // When component unmounts, revoke any blob URLs to prevent memory leaks
    return () => {
      mediaItems.forEach(item => {
        if (item.url && item.url.startsWith('blob:') && item.blobCreatedByUs) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, []);
  
  // Handle file selection
  const handleFileSelect = (e) => {
    if (mediaItems.length >= maxItems) {
      setError(`Maximum ${maxItems} media items allowed`);
      return;
    }
    
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if it's an image
    if (file.type.startsWith('image/')) {
      const blobUrl = URL.createObjectURL(file);
      addMediaItem(file, blobUrl, file.type, true);
    }
    // Check if it's a video
    else if (file.type.startsWith('video/')) {
      // Check video duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src); // Clean up the temporary URL
        if (video.duration > 30) {
          setError('Videos must be 30 seconds or less');
        } else {
          const blobUrl = URL.createObjectURL(file);
          addMediaItem(file, blobUrl, file.type, true);
        }
      };
      
      video.onerror = () => {
        setError('Error loading video. Please try another file.');
      };
      
      video.src = URL.createObjectURL(file);
    } else {
      setError('Unsupported file type. Please upload an image or video.');
    }
    
    // Reset the file input
    e.target.value = null;
  };
  
  // Handle YouTube link
  const handleYoutubeLink = () => {
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
    
    // Add YouTube URL as media item (not a blob, so no need for cleanup)
    addMediaItem(null, youtubeUrl, 'youtube', false);
    youtubeInputRef.current.value = '';
  };
  
  // Add a media item to the list
  const addMediaItem = (file, url, type, blobCreatedByUs = false) => {
    // Check if the URL already exists to prevent duplicates
    if (mediaItems.some(item => item.url === url)) {
      setError("This media has already been added");
      return;
    }
    
    const newItem = { file, url, type, id: Date.now(), blobCreatedByUs };
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
    if (item.type === 'youtube') {
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
    } else if (item.type.startsWith('image/')) {
      return (
        <div className="image-preview">
          <img 
            src={item.url} 
            className="img-fluid rounded" 
            alt="Preview" 
            onError={() => console.error("Error loading image:", item.url)}
          />
        </div>
      );
    } else if (item.type.startsWith('video/')) {
      return (
        <div className="video-preview">
          <video className="w-100 rounded" controls>
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
      {error && <Alert variant="danger">{error}</Alert>}
      
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
            >
              <FaImage className="me-2" /> Add Photo/Video
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
              <Button variant="outline-secondary" onClick={handleYoutubeLink}>
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
        Add up to {maxItems} photos or videos. Videos must be 30 seconds or less.
      </div>
    </div>
  );
};

export default MediaUpload;