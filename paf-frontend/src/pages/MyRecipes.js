import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Badge, Modal, Dropdown } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { postService } from '../api/apiService';
import { FaPlus, FaEdit, FaTrash, FaEllipsisV } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/MyRecipes.css';

const MyRecipes = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  useEffect(() => {
    fetchUserPosts();
  }, [currentUser]);

  const fetchUserPosts = async () => {
    if (!currentUser?.id) return;
    
    try {
      setLoading(true);
      const response = await postService.getPostsByUserId(currentUser.id);
      setPosts(response.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load your recipes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (post) => {
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    try {
      setIsDeletingPost(true);
      await postService.deletePost(postToDelete.id, currentUser.id);
      
      // Remove deleted post from state
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postToDelete.id));
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setPostToDelete(null);
      
      toast.success('Recipe deleted successfully');
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error('Failed to delete recipe. Please try again.');
    } finally {
      setIsDeletingPost(false);
    }
  };

  const handleEditPost = (postId) => {
    navigate(`/edit-recipe/${postId}`);
  };

  // Helper function to render a single media item
  const mediaStyle = { width: '100%', aspectRatio: '16/9', objectFit: 'cover', maxHeight: 260, borderRadius: 12, background: '#f8f8f8' };
  const renderPreviewMedia = (post) => {
    // If we have mediaLinks array, use the first one
    if (post.mediaLinks && post.mediaLinks.length > 0) {
      const mediaUrl = post.mediaLinks[0];
      const mediaType = post.mediaTypes && post.mediaTypes[0];
      if (mediaType?.includes('image')) {
        return (
          <div className="recipe-preview-image">
            <img 
              src={mediaUrl} 
              alt={post.title} 
              className="img-fluid recipe-card-media"
              style={mediaStyle}
              onError={(e) => { e.target.src = "/images/placeholder-image.png"; }}
            />
          </div>
        );
      } else if (mediaType?.includes('video')) {
        return (
          <div className="recipe-preview-placeholder bg-light rounded d-flex align-items-center justify-content-center"
               style={mediaStyle}>
            <video src={mediaUrl} controls style={{ ...mediaStyle, margin: 0 }} />
          </div>
        );
      } else {
        // For other media, show a placeholder
        return (
          <div className="recipe-preview-placeholder bg-light rounded d-flex align-items-center justify-content-center"
               style={mediaStyle}>
            <span className="text-muted">Media content</span>
          </div>
        );
      }
    } 
    // Fall back to legacy mediaLink if available
    else if (post.mediaLink) {
      if (post.mediaType?.includes('image') || post.mediaLink.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return (
          <div className="recipe-preview-image">
            <img 
              src={post.mediaLink} 
              alt={post.title} 
              className="img-fluid recipe-card-media"
              style={mediaStyle}
              onError={(e) => { e.target.src = "/images/placeholder-image.png"; }}
            />
          </div>
        );
      } else if (post.mediaType?.includes('video')) {
        return (
          <div className="recipe-preview-placeholder bg-light rounded d-flex align-items-center justify-content-center"
               style={mediaStyle}>
            <video src={post.mediaLink} controls style={{ ...mediaStyle, margin: 0 }} />
          </div>
        );
      }
    }
    // No media available
    return (
      <div className="recipe-preview-placeholder bg-light rounded d-flex align-items-center justify-content-center"
           style={mediaStyle}>
        <span className="text-muted">No image</span>
      </div>
    );
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading your recipes...</p>
      </Container>
    );
  }

  return (
    <div className="myrecipes-background">
      <Container className="py-4 main-content-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>My Recipes</h2>
          <Button 
            variant="primary"
            onClick={() => navigate('/create-recipe')}
          >
            <FaPlus className="me-2" /> Create New Recipe
          </Button>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        {posts.length === 0 ? (
          <Card className="text-center p-5">
            <Card.Body>
              <h4>You haven't created any recipes yet</h4>
              <p className="text-muted">Share your cooking skills and recipes with the community!</p>
              <Button 
                variant="primary" 
                className="mt-3"
                onClick={() => navigate('/create-recipe')}
              >
                <FaPlus className="me-2" /> Create Your First Recipe
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {posts.map(post => (
              <Col lg={4} md={6} className="mb-4" key={post.id}>
                <Card className="h-100 shadow-sm">
                  {renderPreviewMedia(post)}
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <Card.Title>{post.title}</Card.Title>
                    </div>
                    <div className="mb-2">
                      {post.cuisineType && (
                        <Badge bg="info" className="me-2">{post.cuisineType}</Badge>
                      )}
                      {post.difficultyLevel && (
                        <Badge bg={
                          post.difficultyLevel === 'Beginner' ? 'success' :
                          post.difficultyLevel === 'Intermediate' ? 'warning' : 'danger'
                        }>
                          {post.difficultyLevel}
                        </Badge>
                      )}
                    </div>
                    <Card.Text className="text-muted">
                      {post.contentDescription?.length > 100 
                        ? `${post.contentDescription.substring(0, 100)}...` 
                        : post.contentDescription}
                    </Card.Text>
                    <Button 
                      variant="outline-primary" 
                      className="mt-2"
                      as={Link}
                      to={`/feed#post-${post.id}`}
                    >
                      View in Feed
                    </Button>
                  </Card.Body>
                  <Card.Footer className="bg-white d-flex justify-content-between">
                    <small className="text-muted">
                      Created: {new Date(post.timestamp).toLocaleDateString()}
                    </small>
                    <div>
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditPost(post.id)}
                      >
                        <FaEdit className="me-1" /> Edit
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => confirmDelete(post)}
                      >
                        <FaTrash className="me-1" /> Delete
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        )}
        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete the recipe "{postToDelete?.title}"? 
            This action cannot be undone.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeletePost}
              disabled={isDeletingPost}
            >
              {isDeletingPost ? 'Deleting...' : 'Delete Recipe'}
            </Button>
          </Modal.Footer>
        </Modal>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </Container>
    </div>
  );
};

export default MyRecipes;