import axios from 'axios';
const API_URL = 'http://localhost:8080';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      console.log("Adding token to request:", config.url);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log("No token available for request:", config.url);
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log("Response from:", response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error("Response error:", error.config?.url, error.response?.status);
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  login: (credentials) => {
    return axios.post(`${API_URL}/api/auth/login`, credentials);
  },
  register: (userData) => {
    return axios.post(`${API_URL}/api/auth/register`, userData);
  },
  // This might not be needed since user validation is now handled in the Register component
  checkEmailExists: (email) => {
    return axios.get(`${API_URL}/api/auth/check-email?email=${email}`);
  }
};

// User services
export const userService = {
  getCurrentUser: (id) => api.get(`/api/users/${id}`),
  getAllUsers: () => api.get('/api/users'),
  getUserById: (id) => api.get(`/api/users/${id}`),
  deleteUser: (id) => api.delete(`/api/users/${id}`),
};

// User Profile services
export const profileService = {
  createProfile: (profileData) => api.post('/api/userProfiles', profileData),
  getAllProfiles: () => api.get('/api/userProfiles'),
  getProfileById: (id) => api.get(`/api/userProfiles/${id}`),
  getProfileByUserId: (userId) => api.get(`/api/userProfiles/user/${userId}`),
  updateProfile: (id, profileData) => api.put(`/api/userProfiles/${id}`, profileData),
  deleteProfile: (id) => api.delete(`/api/userProfiles/${id}`),
};

// Post services
export const postService = {
  createPost: (postData) => api.post('/api/posts', postData),
  getAllPosts: () => api.get('/api/posts'),
  getPostsByUserId: (userId) => api.get(`/api/posts/${userId}`),
  updatePost: (id, postData, userId) => api.put(`/api/posts/${id}?userId=${userId}`, postData),
  deletePost: (id, userId) => api.delete(`/api/posts/${id}?userId=${userId}`),
  uploadMedia: (file, userId, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    if (userId) {
      formData.append('userId', userId);
    }
    
    // Log the request details for debugging
    console.log("Uploading file:", file.name, "size:", file.size, "type:", file.type);
    
    return api.post('/api/upload', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${percentCompleted}%`);
        if (onProgress) onProgress(percentCompleted);
      }
    });
  },
  saveExternalMedia: (url, contentType, userId) => {
    return api.post('/api/external-media', {
      url,
      contentType,
      userId
    });
  },
  getPostById: (id) => api.get(`/api/posts/post/${id}`),
};

// Notification services
export const notificationService = {
  getUserNotifications: (userId) => api.get(`/api/notifications/user/${userId}`),
  getUnreadNotifications: (userId) => api.get(`/api/notifications/unread/${userId}`),
  createNotification: (notificationData) => api.post('/api/notifications', notificationData),
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllAsRead: (userId) => api.put(`/api/notifications/read-all/${userId}`),
  deleteNotification: (id) => api.delete(`/api/notifications/${id}`),
};

// Comment services
export const commentService = {
  createComment: (commentData) => {
    // Remove notification creation from here, it will be handled in Feed.js
    return api.post(`/api/comments/${commentData.postId}`, commentData);
  },
  getAllComments: () => api.get('/api/comments'),
  getCommentById: (id) => api.get(`/api/comments/${id}`),
  getCommentsByPostId: (postId) => api.get(`/api/comments/post/${postId}`),
  updateComment: (id, commentText) => api.put(`/api/comments/${id}`, { commentText }),
  deleteComment: (id) => api.delete(`/api/comments/${id}`),
};

// Like services
export const likeService = {
  createLike: (likeData) => {
    // Remove notification creation from here, it will be handled in Feed.js
    return api.post('/api/likes', likeData);
  },
  getLikesByPostId: (postId) => api.get(`/api/likes/${postId}`),
  deleteLike: (id) => api.delete(`/api/likes/${id}`),
};

// Media services
export const mediaService = {
  createMedia: (mediaData) => api.post('/api/media', mediaData),
  getMediaByPostId: (postId) => api.get(`/api/media/${postId}`),
  deleteMedia: (id) => api.delete(`/api/media/${id}`),
  uploadFile: (file, userId, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    if (userId) {
      formData.append('userId', userId);
    }
    return api.post('/api/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000, // 5 minutes
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(percentCompleted);
      }
    });
  },
  saveExternalMedia: (data) => api.post('/api/media/external', data),
  getMedia: (id) => api.get(`/api/media/${id}`),
};

// Story Status Update services
export const storyStatusService = {
  createUpdate: (updateData) => api.post('/api/workoutStatusUpdates', updateData),
  getAllUpdates: () => api.get('/api/workoutStatusUpdates'),
  getUpdatesByUserId: (userId) => api.get(`/api/workoutStatusUpdates/${userId}`),
  updateUpdate: (id, updateData) => api.put(`/api/workoutStatusUpdates/${id}`, updateData),
  deleteUpdate: (id) => api.delete(`/api/workoutStatusUpdates/${id}`),
};

// User Connection services
export const connectionService = {
  getUserConnections: (userId) => api.get(`/api/userConnections/${userId}`),
  createUserConnection: (connectionData) => api.post('/api/userConnections', connectionData),
  unfriend: (userId, friendId) => api.delete(`/api/userConnections/${userId}/friends/${friendId}`),
};

// Bookmark services
export const bookmarkService = {
  getUserBookmarks: (userId) => api.get(`/api/bookmarks/${userId}`),
  createBookmark: (bookmarkData) => api.post('/api/bookmarks', bookmarkData),
  updateBookmark: (id, bookmarkData) => api.put(`/api/bookmarks/${id}`, bookmarkData),
  deleteBookmark: (id) => api.delete(`/api/bookmarks/${id}`),
};

// Group services
export const groupService = {
  getAllGroups: () => api.get('/api/groups'),
  getPublicGroups: () => api.get('/api/groups/public'),
  getGroupById: (id) => api.get(`/api/groups/${id}`),
  getGroupsByCreator: (userId) => api.get(`/api/groups/creator/${userId}`),
  getGroupsByMember: (userId) => api.get(`/api/groups/member/${userId}`),
  createGroup: (groupData) => api.post('/api/groups', groupData),
  updateGroup: (id, groupData) => api.put(`/api/groups/${id}`, groupData),
  updateGroupMembers: (id, memberIds) => api.put(`/api/groups/${id}/members`, memberIds),
  updateGroupAdmins: (id, adminIds) => api.put(`/api/groups/${id}/admins`, adminIds),
  deleteGroup: (id) => api.delete(`/api/groups/${id}`),
};

// Group post services
export const groupPostService = {
  getPostsByGroupId: (groupId) => api.get(`/api/group-posts/group/${groupId}`),
  createPost: (postData) => api.post('/api/group-posts', postData),
  updatePost: (id, postData) => api.put(`/api/group-posts/${id}`, postData),
  deletePost: (id) => api.delete(`/api/group-posts/${id}`),
};

// Export all services
export default {
  authService,
  userService,
  profileService,
  postService,
  commentService,
  likeService,
  mediaService,
  storyStatusService,
  connectionService,
  notificationService,
  bookmarkService,
  groupService,
  groupPostService,
};