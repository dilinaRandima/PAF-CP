import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Badge, Modal, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { postService, commentService, likeService, userService, bookmarkService, notificationService } from '../api/apiService';
import { FaHeart, FaRegHeart, FaComment, FaUserCircle, FaBookmark, FaRegBookmark, FaEdit, FaTrash, FaEllipsisV, FaPlus, FaShare } from 'react-icons/fa';
// Import the MediaUpload component
import MediaUpload from '../components/MediaUpload';
// Import the RecipeCard component
import RecipeCard from '../components/RecipeCard';
// Import toast for notifications
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Feed.css'; // Import the new CSS file
import IngredientInput from '../components/IngredientInput';
import InstructionInput from '../components/InstructionInput';

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

const LoadingSkeletons = () => {
  return (
      <>
        {[1, 2, 3].map(i => (
            <Card key={i} className="custom-card mb-4">
              <Card.Header className="bg-white">
                <div className="d-flex align-items-center">
                  <div className="bg-secondary opacity-25 rounded-circle me-2" style={{width: 40, height: 40}}></div>
                  <div className="flex-grow-1">
                    <div className="bg-secondary opacity-25" style={{width: '60%', height: 16, borderRadius: 4}}></div>
                    <div className="bg-secondary opacity-25 mt-1" style={{width: '30%', height: 12, borderRadius: 4}}></div>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="bg-secondary opacity-25 mb-3" style={{width: '40%', height: 24, borderRadius: 4}}></div>
                {/* Added badges skeletons */}
                <div className="d-flex mb-3">
                  <div className="bg-secondary opacity-25 me-2" style={{width: '10%', height: 20, borderRadius: 16}}></div>
                  <div className="bg-secondary opacity-25 me-2" style={{width: '15%', height: 20, borderRadius: 16}}></div>
                  <div className="bg-secondary opacity-25" style={{width: '20%', height: 20, borderRadius: 16}}></div>
                </div>
                <div className="bg-secondary opacity-25 mb-3" style={{width: '100%', height: 200, borderRadius: 4}}></div>
                <div className="bg-secondary opacity-25 mb-2" style={{width: '100%', height: 16, borderRadius: 4}}></div>
                <div className="bg-secondary opacity-25" style={{width: '80%', height: 16, borderRadius: 4}}></div>
                {/* Added interaction buttons skeleton */}
                <div className="d-flex mt-3">
                  <div className="bg-secondary opacity-25 me-3" style={{width: '8%', height: 20, borderRadius: 4}}></div>
                  <div className="bg-secondary opacity-25 me-3" style={{width: '8%', height: 20, borderRadius: 4}}></div>
                  <div className="bg-secondary opacity-25" style={{width: '10%', height: 20, borderRadius: 4}}></div>
                </div>
              </Card.Body>
            </Card>
        ))}
      </>
  );
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

  // Add state for post editing
  const [editingPost, setEditingPost] = useState(null);
  const [editPostForm, setEditPostForm] = useState({});
  const [editMediaItems, setEditMediaItems] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  // Add videoError state
  const [videoError, setVideoError] = useState({});
  
  // Add navigate for routing
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();

    // Add CSS for comment highlight animation
    const style = document.createElement('style');
    style.innerHTML = `
      .comment-highlight {
        animation: highlightComment 3s ease;
      }
      
      @keyframes highlightComment {
        0% { background-color: rgba(255, 255, 0, 0.3); }
        100% { background-color: transparent; }
      }
    `;
    document.head.appendChild(style);

    // Clean up style on unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Debug logging for media URLs
  useEffect(() => {
    // Log all media URLs for debugging
    posts.forEach(post => {
      if (post.mediaLinks && post.mediaLinks.length > 0) {
        console.log("Post media links:", post.mediaLinks);
        console.log("Post media types:", post.mediaTypes);
      } else if (post.mediaLink) {
        console.log("Post legacy media link:", post.mediaLink);
        console.log("Post legacy media type:", post.mediaType);
      }
    });
  }, [posts]);

  // Add load bookmarks on mount
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
      
      // Log fetched posts to check media arrays
      console.log("Fetched posts:", fetchedPosts);
      
      // Sort posts by timestamp (newest first)
      fetchedPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Ensure each post has proper media arrays
      const processedPosts = fetchedPosts.map(post => {
        // Make sure mediaLinks and mediaTypes are arrays
        const mediaLinks = post.mediaLinks && Array.isArray(post.mediaLinks) 
          ? post.mediaLinks 
          : post.mediaLink ? [post.mediaLink] : [];
          
        const mediaTypes = post.mediaTypes && Array.isArray(post.mediaTypes) 
          ? post.mediaTypes 
          : post.mediaType ? [post.mediaType] : [];
          
        return {
          ...post,
          mediaLinks,
          mediaTypes
        };
      });
      
      setPosts(processedPosts);
      
      // Fetch comments, likes, and user data for each post
      await Promise.all([
        fetchCommentsForPosts(processedPosts),
        fetchLikesForPosts(processedPosts),
      ]);
      
      // Fetch user data for posts
      const userIds = [...new Set(processedPosts.map(post => post.userId))];
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
    const userIdsToFetch = new Set(); // Use a Set to collect unique user IDs
    
    for (const post of posts) {
      try {
        const response = await commentService.getCommentsByPostId(post.id);
        commentsObject[post.id] = response.data;
        
        // Collect user IDs from comments
        response.data.forEach(comment => {
          userIdsToFetch.add(comment.userId);
        });
      } catch (err) {
        console.error(`Error fetching comments for post ${post.id}:`, err);
        commentsObject[post.id] = [];
      }
    }
    
    setComments(commentsObject);
    
    // Fetch user data for all commenters
    if (userIdsToFetch.size > 0) {
      await fetchUsers([...userIdsToFetch]);
    }
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
    // Make sure we're working with unique IDs
    const uniqueIds = [...new Set(userIds)];
    const usersObject = { ...users };
    
    for (const userId of uniqueIds) {
      if (!userId) continue; // Skip null/undefined userIds
      // Skip if we already have complete info for this user
      if (usersObject[userId]?.email) continue;
      
      try {
        const response = await userService.getUserById(userId);
        
        if (response.data) {
          usersObject[userId] = {
            ...response.data,
            // Make sure username is set for display - prefer email without domain
            username: response.data.email ? response.data.email.split('@')[0] : 
                     (response.data.username || `User ${typeof userId === 'string' ? userId.substring(0, 6) : '------'}`)
          };
          
          console.log("Fetched user data for ID:", userId, usersObject[userId]);
        } else {
          console.warn(`No user data returned for ID ${userId}`);
          usersObject[userId] = { 
            username: `User ${typeof userId === 'string' ? userId.substring(0, 6) : '------'}`, 
            email: `User${typeof userId === 'string' ? userId.substring(0, 6) : '------'}`,
            id: userId 
          };
        }
      } catch (err) {
        console.error(`Error fetching user ${userId}:`, err);
        usersObject[userId] = { 
          username: `User ${typeof userId === 'string' ? userId.substring(0, 6) : '------'}`, 
          email: `User${typeof userId === 'string' ? userId.substring(0, 6) : '------'}`, 
          id: userId 
        };
      }
    }
    
    setUsers(usersObject);
  };

  // Add this function to your Feed.js component
  const fetchUserProfile = async (userId) => {
    if (!userId) return; // Prevent null/undefined userId
    // Skip if we already have complete user data
    if (users[userId]?.email) return;
    
    try {
      console.log(`Fetching profile for user ${userId}`);
      const response = await userService.getUserById(userId);
      
      if (response.data) {
        // Update users state with the full profile
        setUsers(prev => ({
          ...prev,
          [userId]: {
            ...response.data,
            // Extract username from email for display
            username: response.data.email ? response.data.email.split('@')[0] : 
                    (response.data.username || `User ${userId.substring(0, 6)}`)
          }
        }));
        console.log(`Updated user data for ${userId}:`, response.data);
      } else {
        console.warn(`No data returned for user ${userId}`);
      }
    } catch (err) {
      console.error(`Error fetching user profile for ${userId}:`, err);
    }
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
      
      // organize media itemss into arrays
      const mediaLinks = mediaItems.map(item => item.url);
      const mediaTypes = mediaItems.map(item => item.type);
      
      console.log("Submitting with media:", { mediaLinks, mediaTypes });
      
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
      
      // Update state with the latest post
      setPosts(prev => [createdPost, ...prev]);
      
      // Reset the form field
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
      
      toast.success('Recipe shared successfully!');
    } catch (err) {
      console.error('Error creating post:', err);
      console.error('Error details:', err.response?.data || err.message);
      toast.error('Failed to create post. Please try again.');
    } finally {
      setSubmittingPost(false);
    }
  };

  // Handle post deletion
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsDeletingPost(true);
      
      await postService.deletePost(postId, currentUser.id);
      
      // Update state to remove the deleted post
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      
      toast.success('Recipe deleted successfully');
    } catch (err) {
      console.error('Error deleting post:', err);
      
      if (err.response?.status === 403) {
        toast.error('You do not have permission to delete this recipe');
      } else {
        toast.error('Failed to delete recipe. Please try again.');
      }
    } finally {
      setIsDeletingPost(false);
    }
  };

  // Handle opening the edit modal
  const handleEditPost = (post) => {
    // Make a copy of the post for editing
    setEditPostForm({
      title: post.title || '',
      contentDescription: post.contentDescription || '',
      ingredients: post.ingredients || [],
      instructions: post.instructions || '',
      cookingTime: post.cookingTime || '',
      difficultyLevel: post.difficultyLevel || '',
      cuisineType: post.cuisineType || ''
    });
    
    // Initialize media items state for editing
    const editMedia = [];
    if (post.mediaLinks && post.mediaLinks.length > 0) {
      post.mediaLinks.forEach((url, index) => {
        editMedia.push({
          url,
          type: post.mediaTypes && post.mediaTypes[index] ? post.mediaTypes[index] : '',
          id: Date.now() + index, // Create a unique ID
          blobCreatedByUs: false
        });
      });
    } else if (post.mediaLink) {
      // Legacy format
      editMedia.push({
        url: post.mediaLink,
        type: post.mediaType || '',
        id: Date.now(),
        blobCreatedByUs: false
      });
    }
    
    setEditMediaItems(editMedia);
    setEditingPost(post);
    setShowEditModal(true);
  };

  // Handle changes to the edit form
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'ingredients') {
      // Handle ingredients as an array
      setEditPostForm(prev => ({
        ...prev,
        [name]: value.split('\n').filter(line => line.trim())
      }));
    } else {
      setEditPostForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle submitting post edits
  const handleEditPostSubmit = async (e) => {
    e.preventDefault();
    
    if (!editPostForm.title || !editPostForm.contentDescription) {
      toast.error('Title and description are required');
      return;
    }
    
    try {
      setIsSubmittingEdit(true);
      
      // Create arrays from media items
      const mediaLinks = editMediaItems.map(item => item.url);
      const mediaTypes = editMediaItems.map(item => item.type);
      
      const postData = {
        ...editPostForm,
        mediaLinks,
        mediaTypes,
        // Legacy format
        mediaLink: mediaLinks.length > 0 ? mediaLinks[0] : '',
        mediaType: mediaTypes.length > 0 ? mediaTypes[0] : ''
      };
      
      const response = await postService.updatePost(editingPost.id, postData, currentUser.id);
      const updatedPost = response.data;
      
      // Update posts list with the updated post
      setPosts(prev => prev.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      ));
      
      // Close the modal
      setShowEditModal(false);
      setEditingPost(null);
      
      toast.success('Recipe updated successfully!');
    } catch (err) {
      console.error('Error updating post:', err);
      
      if (err.response?.status === 403) {
        toast.error('You do not have permission to edit this recipe');
      } else {
        toast.error('Failed to update recipe. Please try again.');
      }
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleNewCommentChange = (postId, value) => {
    setNewComment(prev => ({
      ...prev,
      [postId]: value
    }));
  };

  // UPDATED: handleNewCommentSubmit to create notifications
  const handleNewCommentSubmit = async (postId) => {
    if (!newComment[postId]) return;
    
    try {
      setSubmittingComment(true);
      
      // Get the post (to get post owner for notification)
      const post = posts.find(p => p.id === postId);
      if (!post) {
        throw new Error('Post not found');
      }
      
      const commentData = {
        postId,
        userId: currentUser.id,
        commentText: newComment[postId],
        timestamp: new Date(),
        postOwnerId: post.userId // Add post owner ID for notification
      };
      
      console.log("Submitting comment with data:", commentData);
      
      // Now we call the backend with the postId in the URL path
      const response = await commentService.createComment(commentData, currentUser.id);
      
      // Create comment with user data already included
      const createdComment = response.data;
      
      // Update comments list with the new comment AND associated user data
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), createdComment]
      }));
      
      // Make sure the users state includes the current user with complete info
      setUsers(prev => ({
        ...prev,
        [currentUser.id]: {
          ...prev[currentUser.id],
          ...currentUser,
          // Ensure current user has proper email display
          username: currentUser.email ? currentUser.email.split('@')[0] : currentUser.username,
          email: currentUser.email
        }
      }));
      
      // Mark comment as newly added
      setNewlyAddedComments(prev => ({
        ...prev,
        [createdComment.id]: true
      }));
      
      // Remove the highlight after 3 seconds
      setTimeout(() => {
        setNewlyAddedComments(prev => {
          const updated = {...prev};
          delete updated[createdComment.id];
          return updated;
        });
      }, 3000);
      
      // Clear the comment input
      setNewComment(prev => ({
        ...prev,
        [postId]: ''
      }));
      
      // Create notification for post owner (if different from commenter)
      if (post.userId !== currentUser.id) {
        try {
          const notificationData = {
            userId: post.userId, // Post owner gets the notification
            message: `${currentUser.email ? currentUser.email.split('@')[0] : 'Someone'} commented on your post: "${commentData.commentText.substring(0, 30)}${commentData.commentText.length > 30 ? '...' : ''}"`,
            type: "comment",
            sourceId: postId,
            sourceType: "post", 
            actionUserId: currentUser.id,
            timestamp: new Date(),
            read: false
          };
          
          await notificationService.createNotification(notificationData);
          console.log("Comment notification created successfully");
        } catch (notifyErr) {
          console.error("Failed to create notification:", notifyErr);
          // Continue even if notification fails
        }
      }
      
      // Add toast notification
      toast.success('Comment posted successfully!');
      
      // Update unread comment counts for other users
      const updatedCount = (comments[postId] || []).length + 1;
      if (lastViewedCommentCounts[postId] !== undefined) {
        setUnreadCommentCounts(prev => ({
          ...prev,
          [postId]: Math.max(0, updatedCount - lastViewedCommentCounts[postId])
        }));
      }
      
    } catch (err) {
      console.error('Error creating comment:', err);
      console.error('Error details:', err.response?.data || err.message);
      toast.error('Failed to post comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // UPDATED: handleDeleteComment to use proper API
  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    
    try {
      await commentService.deleteComment(commentId);
      
      // Update comments state
      setComments(prev => ({
        ...prev,
        [postId]: prev[postId].filter(comment => comment.id !== commentId)
      }));
      
      toast.success('Comment deleted successfully');
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error('Failed to delete comment. Please try again.');
    }
  };

  // UPDATED: handleEditComment to store postId
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

  // UPDATED: handleSaveEditedComment to use proper API
  const handleSaveEditedComment = async () => {
    if (!editingComment.id || !editingComment.text.trim()) return;
    
    try {
      const commentData = {
        commentText: editingComment.text
      };
      
      // Use updateComment API method
      await commentService.updateComment(editingComment.id, editingComment.text);
      
      // Mark comment as edited
      setEditedComments(prev => ({
        ...prev,
        [editingComment.id]: true
      }));
      
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
      
      // Add toast notification
      toast.success('Comment updated successfully!');
      
    } catch (err) {
      console.error('Error updating comment:', err);
      toast.error('Failed to update comment. Please try again.');
    }
  };

  // UPDATED: handleLikeToggle to create notifications
  const handleLikeToggle = async (postId) => {
    const currentLikes = likes[postId] || [];
    const userLike = currentLikes.find(like => like.userId === currentUser.id);
    
    // Get the post (to get post owner for notification)
    const post = posts.find(p => p.id === postId);
    if (!post) {
      console.error('Post not found');
      return;
    }
    
    if (userLike) {
      // User already liked the post, so unlike it
      try {
        await likeService.deleteLike(userLike.id);
        // Update likes state
        setLikes(prev => ({
          ...prev,
          [postId]: prev[postId].filter(like => like.id !== userLike.id)
        }));
        toast.info('Post unliked');
      } catch (err) {
        console.error('Error removing like:', err);
        toast.error('Failed to unlike the post. Please try again.');
      }
    } else {
      // User hasn't liked the post, so like it
      try {
        const likeData = {
          postId,
          userId: currentUser.id,
          postOwnerId: post.userId // Add post owner ID for notification
        };
        const response = await likeService.createLike(likeData);
        const createdLike = response.data;
        // Update likes state
        setLikes(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), createdLike]
        }));
        
        // Create notification for post owner (if different from liker)
        if (post.userId !== currentUser.id) {
          try {
            const notificationData = {
              userId: post.userId, // Post owner gets the notification
              message: `${currentUser.email ? currentUser.email.split('@')[0] : 'Someone'} liked your post: "${post.title || 'Recipe'}"`,
              type: "like",
              sourceId: postId,
              sourceType: "post",
              actionUserId: currentUser.id,
              timestamp: new Date(),
              read: false
            };
            
            await notificationService.createNotification(notificationData);
            console.log("Like notification created successfully");
          } catch (notifyErr) {
            console.error("Failed to create notification:", notifyErr);
            // Continue even if notification fails
          }
        }
        toast.success('Post liked!');
      } catch (err) {
        console.error('Error adding like:', err);
        toast.error('Failed to like the post. Please try again.');
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

  // Handle share functionality
  const handleShare = (postId) => {
    try {
      // Get the post URL
      const postUrl = `${window.location.origin}/posts/${postId}`;
      
      // Check if Web Share API is available
      if (navigator.share) {
        navigator.share({
          title: 'Check out this recipe on CookBook!',
          url: postUrl
        })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing:', error));
      } else {
        // Fallback for browsers that don't support the Web Share API
        // Copy to clipboard
        navigator.clipboard.writeText(postUrl)
          .then(() => {
            toast.success('Recipe link copied to clipboard!');
          })
          .catch(err => {
            console.error('Failed to copy link:', err);
            toast.error('Failed to copy link. Please try again.');
          });
      }
    } catch (err) {
      console.error('Error sharing post:', err);
      toast.error('Failed to share post. Please try again.');
    }
  };

  const isPostLikedByUser = (postId) => {
    const postLikes = likes[postId] || [];
    return postLikes.some(like => like.userId === currentUser.id);
  };

  // Focus comment input method for RecipeCard
  const focusCommentInput = (postId) => {
    const commentInputId = `comment-input-${postId}`;
    const commentInput = document.getElementById(commentInputId);
    if (commentInput) {
      commentInput.focus();
    }
  };

  // Updated getDisplayName function to use fetchUserProfile
  const getDisplayName = (userId) => {
    if (!userId) return 'Unknown User'; // Prevent null/undefined errors
    // If we don't have the user data yet, fetch it
    if (!users[userId] || (!users[userId].email && !users[userId].username)) {
      fetchUserProfile(userId);
      return `User ${typeof userId === 'string' ? userId.substring(0, 6) : '------'}`;
    }
    // If we have the email, use that for display
    if (users[userId] && users[userId].email) {
      return users[userId].email.split('@')[0];
    }
    // Fallback to username or ID
    if (users[userId] && users[userId].username) {
      return users[userId].username;
    }
    // If user is still not found, show Unknown User
    return 'Unknown User';
  };

  // Add renderMedia function
  const renderMedia = (post) => {
    if (!post) return null;
    const hasError = videoError[post.id] || false;
    if (post.mediaLinks && post.mediaLinks.length > 0) {
      return (
        <div className="media-gallery">
          {post.mediaLinks.map((mediaUrl, index) => {
            const mediaType = post.mediaTypes && post.mediaTypes[index];
            // Check if it's a YouTube link
            if (mediaUrl && (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be'))) {
              return renderYouTubeEmbed(mediaUrl);
            }
            // Handle image files
            if (mediaType && mediaType.includes('image')) {
              return (
                <div key={index} className="media-item">
                  <img 
                    src={mediaUrl} 
                    alt={post.title || 'Media content'} 
                    className="img-fluid rounded post-media"
                    loading="lazy"
                    onError={(e) => {
                      console.error("Image loading error:", mediaUrl);
                      e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Available";
                    }}
                  />
                </div>
              );
            }
            // Handle video files
            if (mediaType && mediaType.includes('video')) {
              if (hasError) {
                return (
                  <div key={index} className="media-error-container bg-light rounded p-4 text-center">
                    <p className="text-muted mb-0">Video could not be loaded. Please try again later.</p>
                  </div>
                );
              }
              return (
                <div key={index} className="media-item video-container ratio ratio-16x9">
                  <video 
                    controls 
                    playsInline
                    muted
                    preload="metadata"
                    className="rounded"
                    onError={() => {
                      console.error("Video loading error:", mediaUrl);
                      setVideoError(prev => ({...prev, [post.id]: true}));
                    }}
                    onPlay={(e) => {
                      document.querySelectorAll('video').forEach(video => {
                        if (video !== e.target) {
                          video.pause();
                        }
                      });
                    }}
                  >
                    <source src={mediaUrl} type={mediaType} />
                    Your browser does not support the video tag.
                  </video>
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    }
    
    // Legacy format: Handle single mediaLink
    if (post.mediaLink) {
      // YouTube
      if (post.mediaLink.includes('youtube.com') || post.mediaLink.includes('youtu.be')) {
        return renderYouTubeEmbed(post.mediaLink);
      }
      
      // Image
      if (post.mediaType?.includes('image') || post.mediaLink.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return (
          <img 
            src={post.mediaLink} 
            alt={post.title || 'Media content'} 
            className="img-fluid rounded post-media"
            loading="lazy"
            onError={(e) => {
              console.error("Image loading error:", post.mediaLink);
              e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Available";
            }}
          />
        );
      }
      
      // Video
      if (post.mediaType?.includes('video') || post.mediaLink.match(/\.(mp4|mov|avi|wmv|webm)$/i)) {
        if (hasError) {
          return (
            <div className="media-error-container bg-light rounded p-4 text-center">
              <p className="text-muted mb-0">Video could not be loaded. Please try again later.</p>
            </div>
          );
        }
        
        return (
          <div className="video-container ratio ratio-16x9">
            <video 
              controls 
              playsInline
              muted
              preload="metadata"
              className="rounded"
              onError={() => {
                console.error("Video loading error:", post.mediaLink);
                setVideoError(prev => ({...prev, [post.id]: true}));
              }}
              onPlay={(e) => {
                // Pause all other videos when one starts playing
                document.querySelectorAll('video').forEach(video => {
                  if (video !== e.target) {
                    video.pause();
                  }
                });
              }}
              onVisibilityChange={(e) => {
                // Auto-play when video is visible in viewport
                const observer = new IntersectionObserver((entries) => {
                  entries.forEach(entry => {
                    if (entry.isIntersecting) {
                      e.target.play();
                    } else {
                      e.target.pause();
                    }
                  });
                }, { threshold: 0.5 });
                
                observer.observe(e.target);
                return () => observer.disconnect();
              }}
            >
              <source src={post.mediaLink} type={post.mediaType || 'video/mp4'} />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      }
    }
    
    return null;
  };

  // Add renderYouTubeEmbed function
  const renderYouTubeEmbed = (url) => {
    let videoId = '';
    
    try {
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1];
        const ampersandPosition = videoId.indexOf('&');
        if (ampersandPosition !== -1) {
          videoId = videoId.substring(0, ampersandPosition);
        }
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1];
        const questionMarkPosition = videoId.indexOf('?');
        if (questionMarkPosition !== -1) {
          videoId = videoId.substring(0, questionMarkPosition);
        }
      }
      
      if (!videoId) {
        return <div className="alert alert-warning">Invalid YouTube URL</div>;
      }
      
      return (
        <div className="ratio ratio-16x9 mb-3">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    } catch (error) {
      console.error("Error rendering YouTube embed:", error);
      return <div className="alert alert-warning">Could not load YouTube video</div>;
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading recipes...</p>
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
    <div className="feed-background">
      <Container className="py-4 main-content-container">
        <Row>
          <Col lg={8} className="mx-auto">
            {/* Create Post Button */}
            <Card className="custom-card mb-4 text-center">
              <Card.Body className="py-4">
                <h5 className="mb-3">Want to share a recipe or cooking tip?</h5>
                <Button 
                  variant="primary"
                  onClick={() => navigate('/create-recipe')}
                >
                  <FaPlus className="me-2" /> Create New Recipe
                </Button>
              </Card.Body>
            </Card>
            
            {/* Posts Feed */}
            {posts.length === 0 ? (
              <div className="text-center py-5">
                <h4>No recipes yet</h4>
                <p className="text-muted">Be the first to share something!</p>
              </div>
            ) : (
              posts.map(post => (
                <div key={post.id} className="mb-4">
                  {/* Recipe Card Component */}
                  <RecipeCard 
                    post={{
                      ...post,
                      mediaLinks: post.mediaLinks && post.mediaLinks.length > 0
                        ? post.mediaLinks
                        : post.mediaLink
                          ? [post.mediaLink]
                          : [],
                      mediaTypes: post.mediaTypes && post.mediaTypes.length > 0
                        ? post.mediaTypes
                        : post.mediaType
                          ? [post.mediaType]
                          : [],
                    }}
                    user={users[post.userId] || {}}
                    isLiked={isPostLikedByUser(post.id)}
                    isBookmarked={!!bookmarkedPosts[post.id]}
                    commentsCount={(comments[post.id] || []).length}
                    likeCount={(likes[post.id] || []).length}
                    onLike={() => handleLikeToggle(post.id)}
                    onBookmark={() => handleBookmarkToggle(post)}
                    onComment={() => focusCommentInput(post.id)}
                    onShare={() => handleShare(post.id)}
                  />
                  
                  {/* Comment Section */}
                  <Card className="custom-card mb-4">
                    <Card.Footer className="bg-white">
                      {/* Comment List */}
                      {comments[post.id] && comments[post.id].length > 0 && (
                        <div className="mb-3">
                          {comments[post.id].map(comment => (
                            <div key={comment.id} className="d-flex mb-2">
                              <FaUserCircle size={30} className="text-secondary me-2 mt-1" />
                              <div className="bg-light p-2 rounded flex-grow-1">
                                <div className="d-flex justify-content-between align-items-center mb-1" style={{ minHeight: 24 }}>
                                  <span style={{ fontWeight: 600, fontSize: '1rem', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getDisplayName(comment.userId)}</span>
                                  <span style={{ fontSize: '0.95em', color: '#888', marginLeft: 12, whiteSpace: 'nowrap', flexShrink: 0 }}>{formatTimeAgo(comment.timestamp)}</span>
                                  <div style={{ marginLeft: 8 }}>
                                    {comment.userId === currentUser.id && (
                                      <Button 
                                        variant="link" 
                                        className="p-0 text-primary me-2" 
                                        onClick={() => handleEditComment(post.id, comment.id)}
                                      >
                                        <FaEdit size={14} />
                                      </Button>
                                    )}
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
                                <p className="mb-0 mt-1" style={{ wordBreak: 'break-word' }}>{comment.commentText}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Add Comment Form */}
                      <div className="d-flex mt-3" style={{ gap: '0.5rem' }}>
                        <FaUserCircle size={30} className="text-secondary me-2 mt-1" />
                        <Form className="flex-grow-1 d-flex align-items-center" style={{ width: '100%' }}>
                          <Form.Control
                            id={`comment-input-${post.id}`}
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
                            style={{ minWidth: 0, flexGrow: 1 }}
                          />
                          <Button
                            variant="primary"
                            className="ms-2 post-button"
                            style={{ whiteSpace: 'nowrap', minWidth: 70, padding: '0.375rem 1.25rem', fontWeight: 500 }}
                            disabled={submittingComment || !newComment[post.id]}
                            onClick={() => handleNewCommentSubmit(post.id)}
                          >
                            {/*{submittingComment ? 'Posting...' : 'Post'}*/}

                            {/* WITH THIS */}
                            {submittingComment ? (
                                <>
                                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                                  Posting...
                                </>
                            ) : (
                                'Post'
                            )}

                          </Button>
                        </Form>
                      </div>
                    </Card.Footer>
                  </Card>
                </div>
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
            <Button variant="primary" onClick={handleSaveEditedComment} className="post-button">
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* Post Edit Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Edit Recipe</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleEditPostSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Recipe Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={editPostForm.title || ''}
                  onChange={handleEditFormChange}
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
                  value={editPostForm.contentDescription || ''}
                  onChange={handleEditFormChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Ingredients</Form.Label>
                <IngredientInput
                  ingredients={Array.isArray(editPostForm.ingredients) ? editPostForm.ingredients : (editPostForm.ingredients ? editPostForm.ingredients.split('\n') : [])}
                  onChange={ingredients => setEditPostForm(prev => ({ ...prev, ingredients }))}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Instructions</Form.Label>
                <InstructionInput
                  instructions={Array.isArray(editPostForm.instructions) ? editPostForm.instructions : (editPostForm.instructions ? editPostForm.instructions.split('\n') : [])}
                  onChange={instructions => setEditPostForm(prev => ({ ...prev, instructions }))}
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
                      value={editPostForm.cookingTime || ''}
                      onChange={handleEditFormChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Difficulty Level</Form.Label>
                    <Form.Select
                      name="difficultyLevel"
                      value={editPostForm.difficultyLevel || ''}
                      onChange={handleEditFormChange}
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
                      value={editPostForm.cuisineType || ''}
                      onChange={handleEditFormChange}
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
              {/* Add MediaUpload for editing */}
              <Form.Group className="mb-3">
                <Form.Label>Photos/Videos</Form.Label>
                <MediaUpload 
                  onChange={items => setEditMediaItems(items)} 
                  maxItems={3}
                  initialItems={editMediaItems}
                  jsxMode="false"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleEditPostSubmit}
              disabled={isSubmittingEdit}
              className="post-button"
            >
              {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
            </Button>
          </Modal.Footer>
        </Modal>
        
        {/* Toast Container for notifications */}
        <ToastContainer position="bottom-right" autoClose={3000} />
      </Container>
    </div>
  );
  
};


export default Feed;