import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Badge, Modal } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { postService, commentService, likeService, userService, bookmarkService } from '../api/apiService';
import { FaHeart, FaRegHeart, FaComment, FaUserCircle, FaBookmark, FaRegBookmark, FaEdit, FaTrash } from 'react-icons/fa';
// Import the MediaUpload component
import MediaUpload from '../components/MediaUpload';
// Import toast for notifications
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Replace date-fns with a simple function
const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
};

const Feed = () => {
  const { currentUser } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPost, setNewPost] = useState({ contentDescription: '', title: '' });
  // Add state for media items
  const [mediaItems, setMediaItems] = useState([]);
  const [comments, setComments] = useState({});
  const [likes, setLikes] = useState({});
  const [users, setUsers] = useState({});
  const [newComment, setNewComment] = useState({});
  const [submittingPost, setSubmittingPost] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingComment, setEditingComment] = useState({ id: null, text: '' });
  // Add state to track bookmarked posts
  const [bookmarkedPosts, setBookmarkedPosts] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  // Add useEffect to load user's bookmarks when component mounts
  useEffect(() => {
    const fetchUserBookmarks = async () => {
      try {
        const response = await bookmarkService.getUserBookmarks(currentUser.id);
        // Create a map of bookmarked post IDs for easy lookup
        const bookmarkMap = {};
        response.data.forEach(bookmark => {
          bookmarkMap[bookmark.resourceId] = bookmark;
        });
        setBookmarkedPosts(bookmarkMap);
      } catch (err) {
        console.error("Error fetching user bookmarks:", err);
      }
    };

    if (currentUser?.id) {
      fetchUserBookmarks();
    }
  }, [currentUser]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postService.getAllPosts();
      const fetchedPosts = response.data;
      // Sort posts by timestamp (newest first)
      fetchedPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setPosts(fetchedPosts);
      // Fetch comments, likes, and user data for each post
      await Promise.all([
        fetchCommentsForPosts(fetchedPosts),
        fetchLikesForPosts(fetchedPosts),
      ]);
      // Fetch user data for posts
      const userIds = [...new Set(fetchedPosts.map(post => post.userId))];
      await fetchUsers(userIds);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentsForPosts = async (posts) => {
    const commentsObject = { ...comments };
    for (const post of posts) {
      try {
        const response = await commentService.getCommentsByPostId(post.id);
        commentsObject[post.id] = response.data;
        // Also fetch user data for commenters
        const commenterIds = response.data.map(comment => comment.userId);
        await fetchUsers(commenterIds);
      } catch (err) {
        console.error(`Error fetching comments for post ${post.id}:`, err);
        commentsObject[post.id] = [];
      }
    }
    setComments(commentsObject);
  };

  const fetchLikesForPosts = async (posts) => {
    const likesObject = { ...likes };
    for (const post of posts) {
      try {
        const response = await likeService.getLikesByPostId(post.id);
        likesObject[post.id] = response.data;
      } catch (err) {
        console.error(`Error fetching likes for post ${post.id}:`, err);
        likesObject[post.id] = [];
      }
    }
    setLikes(likesObject);
  };

  const fetchUsers = async (userIds) => {
    const uniqueIds = [...new Set(userIds)].filter(id => !users[id]);
    const usersObject = { ...users };
    for (const userId of uniqueIds) {
      try {
        const response = await userService.getUserById(userId);
        usersObject[userId] = response.data;
      } catch (err) {
        console.error(`Error fetching user ${userId}:`, err);
        usersObject[userId] = { username: 'Unknown User' };
      }
    }
    setUsers(usersObject);
  };

  const handleNewPostChange = (e) => {
    const { name, value } = e.target;
    setNewPost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewPostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.contentDescription) return;
    
    try {
      setSubmittingPost(true);
      
      // Create arrays from media items
      const mediaLinks = mediaItems.map(item => item.url);
      const mediaTypes = mediaItems.map(item => item.type);
      
      console.log("Submitting with media:", { mediaLinks, mediaTypes }); // Debugging
      
      const postData = {
        ...newPost,
        userId: currentUser.id,
        timestamp: new Date(),
        // Add both formats to ensure compatibility
        mediaLinks: mediaLinks,
        mediaTypes: mediaTypes,
        // Legacy format - only use first item if available
        mediaLink: mediaLinks.length > 0 ? mediaLinks[0] : '',
        mediaType: mediaTypes.length > 0 ? mediaTypes[0] : ''
      };
      
      const response = await postService.createPost(postData);
      const createdPost = response.data;
      
      // Update posts list with the new post
      setPosts(prev => [createdPost, ...prev]);
      
      // Clear the form
      setNewPost({ 
        title: '', 
        contentDescription: '', 
        ingredients: [], 
        instructions: '',
        cookingTime: '',
        difficultyLevel: '',
        cuisineType: ''
      });
      setMediaItems([]);
    } catch (err) {
      console.error('Error creating post:', err);
      console.error('Error details:', err.response?.data || err.message);
      alert('Failed to create post. Please try again. ' + (err.response?.data || err.message));
    } finally {
      setSubmittingPost(false);
    }
  };
  const handleNewCommentChange = (postId, value) => {
    setNewComment(prev => ({
      ...prev,
      [postId]: value
    }));
  };

  const handleNewCommentSubmit = async (postId) => {
    if (!newComment[postId]) return;
    
    try {
      setSubmittingComment(true);
      
      const commentData = {
        postId,
        userId: currentUser.id,
        commentText: newComment[postId],
        timestamp: new Date()
      };
      
      // Pass currentUser.id as the second parameter
      const response = await commentService.createComment(commentData, currentUser.id);
      
      // Update comments list with the new comment
      const createdComment = response.data;
      
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), createdComment]
      }));
      
      // Clear the comment input
      setNewComment(prev => ({
        ...prev,
        [postId]: ''
      }));
    } catch (err) {
      console.error('Error creating comment:', err);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    
    try {
      await commentService.deleteComment(commentId, currentUser.id);
      
      // Update comments state
      setComments(prev => ({
        ...prev,
        [postId]: prev[postId].filter(comment => comment.id !== commentId)
      }));
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const handleEditComment = (postId, commentId) => {
    const comment = comments[postId].find(c => c.id === commentId);
    if (comment) {
      setEditingComment({ 
        id: commentId, 
        postId,
        text: comment.commentText 
      });
    }
  };

  const handleSaveEditedComment = async () => {
    if (!editingComment.id || !editingComment.text.trim()) return;
    
    try {
      const commentData = {
        commentText: editingComment.text
      };
      
      await commentService.updateComment(editingComment.id, commentData, currentUser.id);
      
      // Update comments state
      setComments(prev => ({
        ...prev,
        [editingComment.postId]: prev[editingComment.postId].map(comment => 
          comment.id === editingComment.id 
            ? { ...comment, commentText: editingComment.text } 
            : comment
        )
      }));
      
      setEditingComment({ id: null, text: '' });
    } catch (err) {
      console.error('Error updating comment:', err);
      alert('Failed to update comment. Please try again.');
    }
  };

  const handleLikeToggle = async (postId) => {
    const currentLikes = likes[postId] || [];
    const userLike = currentLikes.find(like => like.userId === currentUser.id);
    if (userLike) {
      // User already liked the post, so unlike it
      try {
        await likeService.deleteLike(userLike.id);
        // Update likes state
        setLikes(prev => ({
          ...prev,
          [postId]: prev[postId].filter(like => like.id !== userLike.id)
        }));
      } catch (err) {
        console.error('Error removing like:', err);
      }
    } else {
      // User hasn't liked the post, so like it
      try {
        const likeData = {
          postId,
          userId: currentUser.id
        };
        const response = await likeService.createLike(likeData);
        const createdLike = response.data;
        // Update likes state
        setLikes(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), createdLike]
        }));
      } catch (err) {
        console.error('Error adding like:', err);
      }
    }
  };

  // Implement proper bookmark toggle functionality
  const handleBookmarkToggle = async (post) => {
    try {
      // Check if post is already bookmarked
      if (bookmarkedPosts[post.id]) {
        // If bookmarked, remove it
        await bookmarkService.deleteBookmark(bookmarkedPosts[post.id].id);
        
        // Update state
        setBookmarkedPosts(prev => {
          const updated = {...prev};
          delete updated[post.id];
          return updated;
        });
        
        toast.success('Post removed from bookmarks');
      } else {
        // If not bookmarked, add it
        const bookmarkData = {
          userId: currentUser.id,
          resourceId: post.id,
          resourceType: "post",
          title: post.title || "Recipe post",
          note: post.contentDescription?.substring(0, 100) || "",
          tags: post.cuisineType ? [post.cuisineType] : []
        };
        
        const response = await bookmarkService.createBookmark(bookmarkData);
        
        // Update state
        setBookmarkedPosts(prev => ({
          ...prev,
          [post.id]: response.data
        }));
        
        toast.success('Post added to bookmarks');
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
      toast.error("Failed to bookmark post. Please try again.");
    }
  };

 // Update the renderSingleMedia function in Feed.js
 const renderSingleMedia = (mediaLink, mediaType) => {
  // Handle YouTube links
  if (mediaType === 'youtube' || mediaLink.includes('youtube.com') || mediaLink.includes('youtu.be')) {
    let videoId = '';
    
    try {
      if (mediaLink.includes('youtube.com/watch?v=')) {
        videoId = mediaLink.split('v=')[1];
        const ampersandPosition = videoId.indexOf('&');
        if (ampersandPosition !== -1) {
          videoId = videoId.substring(0, ampersandPosition);
        }
      } else if (mediaLink.includes('youtu.be/')) {
        videoId = mediaLink.split('youtu.be/')[1];
        const questionMarkPosition = videoId.indexOf('?');
        if (questionMarkPosition !== -1) {
          videoId = videoId.substring(0, questionMarkPosition);
        }
      }
      
      if (videoId) {
        console.log("Rendering YouTube video:", videoId);
        return (
          <div className="ratio ratio-16x9 mb-3">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded w-100"
            ></iframe>
          </div>
        );
      }
    } catch (error) {
      console.error("Error rendering YouTube video:", error);
    }
  }
  
  

  
  // Handle images
  else if (mediaType?.includes('image') || mediaLink.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return (
      <img 
        src={mediaLink} 
        alt="Post content" 
        className="img-fluid rounded mb-3" 
      />
    );
  }
  
  // Handle videos
  else if (mediaType?.includes('video') || mediaLink.match(/\.(mp4|mov|avi|wmv|webm)$/i)) {
    return (
      <div className="ratio ratio-16x9 mb-3">
        <video 
          src={mediaLink}
          controls
          preload="metadata"
          className="rounded w-100"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }
  
  // If no media type matches, try to provide a link
  return (
    <a href={mediaLink} target="_blank" rel="noopener noreferrer" className="d-block mb-3">
      {mediaLink}
    </a>
  );
};

  // Update renderPostContent function to fix duplicate images issue
  const renderPostContent = (post) => {
    // Only use mediaLinks array if it exists and has items
    if (post.mediaLinks && post.mediaLinks.length > 0) {
      return (
        <div className="post-media-gallery">
          <Row>
            {post.mediaLinks.map((mediaLink, index) => (
              <Col xs={12} md={post.mediaLinks.length > 1 ? 6 : 12} key={index} className="mb-3">
                {renderSingleMedia(mediaLink, post.mediaTypes ? post.mediaTypes[index] : null)}
              </Col>
            ))}
          </Row>
        </div>
      );
    }
    // Only use single mediaLink as fallback if no mediaLinks array exists
    else if (post.mediaLink) {
      return renderSingleMedia(post.mediaLink, post.mediaType);
    }
    
    return null;
  };

  const isPostLikedByUser = (postId) => {
    const postLikes = likes[postId] || [];
    return postLikes.some(like => like.userId === currentUser.id);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading posts...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger">{error}</div>
        <Button onClick={fetchPosts}>Try Again</Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col lg={8} className="mx-auto">
          {/* Create Post Form */}
          <Card className="custom-card mb-4">
            <Card.Body>
              <h5 className="mb-3">Share a Cooking Skill or Recipe</h5>
              <Form onSubmit={handleNewPostSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Recipe Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={newPost.title || ''}
                    onChange={handleNewPostChange}
                    placeholder="Name of your dish or cooking technique"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Share the story behind this recipe or skill"
                    name="contentDescription"
                    value={newPost.contentDescription}
                    onChange={handleNewPostChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Ingredients</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="List your ingredients, one per line"
                    name="ingredients"
                    value={newPost.ingredients?.join('\n') || ''}
                    onChange={(e) => handleNewPostChange({
                      target: {
                        name: 'ingredients',
                        value: e.target.value.split('\n').filter(line => line.trim())
                      }
                    })}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Instructions</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    placeholder="Share the step-by-step cooking process"
                    name="instructions"
                    value={newPost.instructions || ''}
                    onChange={handleNewPostChange}
                  />
                </Form.Group>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cooking Time</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g. 30 mins"
                        name="cookingTime"
                        value={newPost.cookingTime || ''}
                        onChange={handleNewPostChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Difficulty Level</Form.Label>
                      <Form.Select
                        name="difficultyLevel"
                        value={newPost.difficultyLevel || ''}
                        onChange={handleNewPostChange}
                      >
                        <option value="">Select difficulty</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cuisine Type</Form.Label>
                      <Form.Select
                        name="cuisineType"
                        value={newPost.cuisineType || ''}
                        onChange={handleNewPostChange}
                      >
                        <option value="">Select cuisine</option>
                        <option value="Italian">Italian</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Mexican">Mexican</option>
                        <option value="Indian">Indian</option>
                        <option value="Japanese">Japanese</option>
                        <option value="French">French</option>
                        <option value="Thai">Thai</option>
                        <option value="American">American</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                {/* Replace the existing media fields with MediaUpload component */}
                <Form.Group className="mb-3">
                  <Form.Label>Add Photos/Videos</Form.Label>
                  <MediaUpload 
                    onChange={items => setMediaItems(items)} 
                    maxItems={3} 
                  />
                </Form.Group>
                <div className="text-end">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submittingPost || !newPost.title || !newPost.contentDescription}
                  >
                    {submittingPost ? 'Posting...' : 'Share Recipe'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
          {/* Posts Feed */}
          {posts.length === 0 ? (
            <div className="text-center py-5">
              <h4>No posts yet</h4>
              <p className="text-muted">Be the first to share something!</p>
            </div>
          ) : (
            posts.map(post => (
              <Card key={post.id} className="custom-card mb-4">
                {/* Post Header */}
                <Card.Header className="bg-white d-flex align-items-center">
                  {users[post.userId]?.profileImage ? (
                    <img
                      src={users[post.userId].profileImage}
                      alt="User avatar"
                      className="rounded-circle me-2"
                      width="40"
                      height="40"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <FaUserCircle size={40} className="text-secondary me-2" />
                  )}
                  <div>
                    <h6 className="mb-0">{users[post.userId]?.username || 'Unknown User'}</h6>
                    <small className="text-muted">
                      {formatTimeAgo(post.timestamp)}
                    </small>
                  </div>
                </Card.Header>
                {/* Post Content */}
                <Card.Body>
                  <h5 className="mb-3">{post.title}</h5>
                  {post.cuisineType && (
                    <Badge bg="info" className="mb-3 me-2">{post.cuisineType}</Badge>
                  )}
                  {post.difficultyLevel && (
                    <Badge bg={
                      post.difficultyLevel === 'Beginner' ? 'success' :
                      post.difficultyLevel === 'Intermediate' ? 'warning' : 'danger'
                    } className="mb-3 me-2">
                      {post.difficultyLevel}
                    </Badge>
                  )}
                  {post.cookingTime && (
                    <Badge bg="secondary" className="mb-3">⏱️ {post.cookingTime}</Badge>
                  )}
                  {renderPostContent(post)}
                  <Card.Text>{post.contentDescription}</Card.Text>
                  {post.ingredients && post.ingredients.length > 0 && (
                    <div className="mt-3">
                      <h6>Ingredients:</h6>
                      <ul>
                        {post.ingredients.map((ingredient, index) => (
                          <li key={index}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {post.instructions && (
                    <div className="mt-3">
                      <h6>Instructions:</h6>
                      <p>{post.instructions}</p>
                    </div>
                  )}
                  {/* Post Actions */}
                  <div className="d-flex mt-3">
                    <Button
                      variant="link"
                      className={`text-decoration-none ${isPostLikedByUser(post.id) ? 'text-danger' : 'text-muted'}`}
                      onClick={() => handleLikeToggle(post.id)}
                    >
                      {isPostLikedByUser(post.id) ? (
                        <FaHeart className="me-1" />
                      ) : (
                        <FaRegHeart className="me-1" />
                      )}
                      {(likes[post.id] || []).length}
                    </Button>
                    <Button
                      variant="link"
                      className="text-decoration-none text-muted ms-3"
                    >
                      <FaComment className="me-1" />
                      {(comments[post.id] || []).length}
                    </Button>
                    <Button
                      variant="link"
                      className={`text-decoration-none ${bookmarkedPosts[post.id] ? 'text-primary' : 'text-muted'} ms-3`}
                      onClick={() => handleBookmarkToggle(post)}
                    >
                      {bookmarkedPosts[post.id] ? (
                        <FaBookmark className="me-1" />
                      ) : (
                        <FaRegBookmark className="me-1" />
                      )}
                      Bookmark
                    </Button>
                  </div>
                </Card.Body>
                {/* Comments Section */}
                <Card.Footer className="bg-white">
                  {/* Comment List */}
                  {comments[post.id] && comments[post.id].length > 0 && (
                    <div className="mb-3">
                      {comments[post.id].map(comment => (
                        <div key={comment.id} className="d-flex mb-2">
                          <FaUserCircle size={30} className="text-secondary me-2 mt-1" />
                          <div className="bg-light p-2 rounded flex-grow-1">
                            <div className="d-flex justify-content-between">
                              <strong>{users[comment.userId]?.username || 'Unknown User'}</strong>
                              <div>
                                <small className="text-muted me-2">
                                  {formatTimeAgo(comment.timestamp)}
                                </small>
                                {/* Show edit button only to comment author */}
                                {comment.userId === currentUser.id && (
                                  <Button 
                                    variant="link" 
                                    className="p-0 text-primary me-2" 
                                    onClick={() => handleEditComment(post.id, comment.id)}
                                  >
                                    <FaEdit size={14} />
                                  </Button>
                                )}
                                {/* Show delete button to comment author or post owner */}
                                {(comment.userId === currentUser.id || post.userId === currentUser.id) && (
                                  <Button 
                                    variant="link" 
                                    className="p-0 text-danger" 
                                    onClick={() => handleDeleteComment(post.id, comment.id)}
                                  >
                                    <FaTrash size={14} />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className="mb-0">{comment.commentText}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Add Comment Form */}
                  <div className="d-flex">
                    <FaUserCircle size={30} className="text-secondary me-2 mt-1" />
                    <Form className="flex-grow-1 d-flex">
                      <Form.Control
                        type="text"
                        placeholder="Write a comment..."
                        value={newComment[post.id] || ''}
                        onChange={(e) => handleNewCommentChange(post.id, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleNewCommentSubmit(post.id);
                          }
                        }}
                      />
                      <Button
                        variant="primary"
                        className="ms-2"
                        disabled={submittingComment || !newComment[post.id]}
                        onClick={() => handleNewCommentSubmit(post.id)}
                      >
                        Post
                      </Button>
                    </Form>
                  </div>
                </Card.Footer>
              </Card>
            ))
          )}
        </Col>
      </Row>

      {/* Comment Edit Modal */}
      <Modal show={!!editingComment.id} onHide={() => setEditingComment({ id: null, text: '' })}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={3}
                value={editingComment.text}
                onChange={(e) => setEditingComment(prev => ({ ...prev, text: e.target.value }))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditingComment({ id: null, text: '' })}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveEditedComment}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Toast Container for notifications */}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </Container>
  );
};

export default Feed;