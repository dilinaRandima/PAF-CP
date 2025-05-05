import axios from 'axios';
const API_URL = 'http://localhost:8080/api';
// Create axios instance with base URL
const api = axios.create({
baseURL: API_URL,
});
// Add request interceptor to add auth token
// In src/api/apiService.js
// Add this debugging interceptor
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
login: (credentials) => api.post('/auth/login', credentials),
register: (userData) => api.post('/auth/register', userData),
checkUsername: (username) => api.get(`/users/exists/${username}`),
};
// User services
export const userService = {
getCurrentUser: (id) => api.get(`/users/${id}`),
getAllUsers: () => api.get('/users'),
getUserById: (id) => api.get(`/users/${id}`),
deleteUser: (id) => api.delete(`/users/${id}`),
};
// User Profile services
export const profileService = {
createProfile: (profileData) => api.post('/userProfiles', profileData),
getAllProfiles: () => api.get('/userProfiles'),
getProfileById: (id) => api.get(`/userProfiles/${id}`),
getProfileByUserId: (userId) => api.get(`/userProfiles/user/${userId}`),
updateProfile: (id, profileData) => api.put(`/userProfiles/${id}`, profileData),
deleteProfile: (id) => api.delete(`/userProfiles/${id}`),
};
// Post services
export const postService = {
  createPost: (postData) => api.post('/posts', postData),
  getAllPosts: () => api.get('/posts'),
  getPostsByUserId: (userId) => api.get(`/posts/${userId}`),
  updatePost: (id, postData) => api.put(`/posts/${id}`, postData),
  deletePost: (id) => api.delete(`/posts/${id}`),
  // Add a new method for file uploads
  uploadMedia: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: progressEvent => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onProgress) onProgress(percentCompleted);
      }
    });
  }
};
// Comment services
export const commentService = {
createComment: (commentData, userId) => api.post(`/comments?userId=${userId}`, commentData),
getAllComments: () => api.get('/comments'),
getCommentById: (id) => api.get(`/comments/${id}`),
getCommentsByPostId: (postId) => api.get(`/comments/post/${postId}`),
updateComment: (id, commentData, userId) => api.put(`/comments/${id}?userId=${userId}`, commentData),
deleteComment: (id, userId) => api.delete(`/comments/${id}?userId=${userId}`),
};
// Like services
export const likeService = {
createLike: (likeData) => api.post('/likes', likeData),
getLikesByPostId: (postId) => api.get(`/likes/${postId}`),
deleteLike: (id) => api.delete(`/likes/${id}`),
};
// Media services
export const mediaService = {
createMedia: (mediaData) => api.post('/media', mediaData),
getMediaByPostId: (postId) => api.get(`/media/${postId}`),
deleteMedia: (id) => api.delete(`/media/${id}`),
};
// Meal Plan services
export const mealPlanService = {
createMealPlan: (mealPlanData) => api.post('/MealPlans', mealPlanData),
getAllMealPlans: () => api.get('/MealPlans'),
getMealPlansByUserId: (userId) => api.get(`/MealPlans/${userId}`),
updateMealPlan: (id, mealPlanData) => api.put(`/MealPlans/${id}`, mealPlanData),
deleteMealPlan: (id) => api.delete(`/MealPlans/${id}`),
};
// Skill Share services
export const skillShareService = {
createSkillShare: (skillShareData) => api.post('/SkillShares', skillShareData),
getAllSkillShares: () => api.get('/SkillShares'),
getSkillSharesByUserId: (userId) => api.get(`/SkillShares/${userId}`),
updateSkillShare: (id, skillShareData) => api.put(`/SkillShares/${id}`, skillShareData),
deleteSkillShare: (id) => api.delete(`/SkillShares/${id}`),
};
// Story Status Update services
export const storyStatusService = {
createUpdate: (updateData) => api.post('/workoutStatusUpdates', updateData),
getAllUpdates: () => api.get('/workoutStatusUpdates'),
getUpdatesByUserId: (userId) => api.get(`/workoutStatusUpdates/${userId}`),
updateUpdate: (id, updateData) => api.put(`/workoutStatusUpdates/${id}`, updateData),
deleteUpdate: (id) => api.delete(`/workoutStatusUpdates/${id}`),
};
// User Connection services
export const connectionService = {
getUserConnections: (userId) => api.get(`/userConnections/${userId}`),
createUserConnection: (connectionData) => api.post('/userConnections', connectionData),
unfriend: (userId, friendId) => api.delete(`/userConnections/${userId}/friends/${friendId}`),
};
// Update the notification service
export const notificationService = {
getUserNotifications: (userId) => api.get(`/notifications/user/${userId}`),
getUnreadNotifications: (userId) => api.get(`/notifications/unread/${userId}`),
createNotification: (notificationData) => api.post('/notifications', notificationData),
markAsRead: (id) => api.put(`/notifications/${id}/read`),
markAllAsRead: (userId) => api.put(`/notifications/read-all/${userId}`),
deleteNotification: (id) => api.delete(`/notifications/${id}`),
};
export const bookmarkService = {
getUserBookmarks: (userId) => api.get(`/bookmarks/${userId}`),
createBookmark: (bookmarkData) => api.post('/bookmarks', bookmarkData),
updateBookmark: (id, bookmarkData) => api.put(`/bookmarks/${id}`, bookmarkData),
deleteBookmark: (id) => api.delete(`/bookmarks/${id}`),
};
export const groupService = {
getAllGroups: () => api.get('/groups'),
getPublicGroups: () => api.get('/groups/public'),
getGroupById: (id) => api.get(`/groups/${id}`),
getGroupsByCreator: (userId) => api.get(`/groups/creator/${userId}`),
getGroupsByMember: (userId) => api.get(`/groups/member/${userId}`),
createGroup: (groupData) => api.post('/groups', groupData),
updateGroup: (id, groupData) => api.put(`/groups/${id}`, groupData),
updateGroupMembers: (id, memberIds) => api.put(`/groups/${id}/members`, memberIds),
updateGroupAdmins: (id, adminIds) => api.put(`/groups/${id}/admins`, adminIds),
deleteGroup: (id) => api.delete(`/groups/${id}`),
};
export const groupPostService = {
getPostsByGroupId: (groupId) => api.get(`/group-posts/group/${groupId}`),
createPost: (postData) => api.post('/group-posts', postData),
updatePost: (id, postData) => api.put(`/group-posts/${id}`, postData),
deletePost: (id) => api.delete(`/group-posts/${id}`),
};
export default {
authService,
userService,
profileService,
postService,
commentService,
likeService,
mediaService,
mealPlanService,
skillShareService,
storyStatusService,
connectionService,
notificationService,
bookmarkService,
groupService,
groupPostService,
};