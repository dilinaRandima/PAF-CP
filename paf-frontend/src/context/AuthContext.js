import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [accessToken, setAccessTokenState] = useState(localStorage.getItem('accessToken') || null);
  const [refreshToken, setRefreshTokenState] = useState(localStorage.getItem('refreshToken') || null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Add these methods for OAuth login
  const setAccessToken = (token) => {
    localStorage.setItem('accessToken', token);
    setAccessTokenState(token);
  };
  
  const setRefreshToken = (token) => {
    localStorage.setItem('refreshToken', token);
    setRefreshTokenState(token);
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const storedUserId = localStorage.getItem('userId');
        
        if (storedAccessToken) {
          // Check if token is expired
          try {
            const decodedToken = jwtDecode(storedAccessToken);
            const currentTime = Date.now() / 1000;
            
            console.log("Token validation:", {
              expires: new Date(decodedToken.exp * 1000).toLocaleString(),
              currentTime: new Date(currentTime * 1000).toLocaleString(),
              isExpired: decodedToken.exp < currentTime
            });
            
            if (decodedToken.exp < currentTime) {
              // Token is expired, try to use refresh token
              if (storedRefreshToken) {
                await refreshAccessToken();
              } else {
                // No refresh token, logout
                logout();
              }
            } else {
              // Token is valid, set user
              setAccessTokenState(storedAccessToken);
              setRefreshTokenState(storedRefreshToken);
              
              // Use userId from token or from localStorage
              const userId = decodedToken.sub || storedUserId;
              
              if (userId) {
                localStorage.setItem('userId', userId);
                
                // Set current user with initial data
                setCurrentUser({ id: userId });
                
                // Then fetch full user data
                try {
                  await fetchUserData(userId);
                } catch (error) {
                  console.error("Error fetching user data during init:", error);
                  // Don't logout, just continue with partial user data
                }
              } else {
                console.error("No userId found in token or localStorage");
                logout();
              }
            }
          } catch (error) {
            console.error("Token decode error:", error);
            logout();
          }
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const fetchUserData = async (userId) => {
    try {
      console.log("Fetching user data for ID:", userId);
      console.log("Using access token:", accessToken?.substring(0, 20) + "...");
      
      const response = await axios.get(`http://localhost:8080/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken || localStorage.getItem('accessToken')}`
        }
      });
      
      console.log("User data response:", response.data);
      
      if (response.data) {
        setCurrentUser(response.data);
      } else {
        console.warn("Empty user data received");
        // Still set the basic user with ID to prevent logout loops
        setCurrentUser(prev => prev || { id: userId });
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      
      // Instead of logging out immediately, set a minimal user object
      // This helps prevent logout loops when the API has issues
      setCurrentUser(prev => prev || { id: userId });
      
      // Let the caller handle the error
      throw error;
    }
  };

  const refreshAccessToken = async () => {
    try {
      // Implement refresh token logic here
      // For your backend, you might need to create a specific refresh endpoint
      console.log('Refreshing token...');
      
      // For now, just logging out the user if refresh token flow is not implemented
      logout();
    } catch (error) {
      console.error('Failed to refresh token:', error);
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      console.log("Attempting login for email:", email);
      
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password
      });
      
      console.log("Login response:", response.data);
      
      // Extract the token data from the response
      const { accessToken: newAccessToken, refreshToken: newRefreshToken, userId } = response.data;
      
      if (!newAccessToken || !userId) {
        console.error("Missing required data in login response:", response.data);
        return {
          success: false,
          message: "Invalid server response. Please try again."
        };
      }
      
      // Save tokens to localStorage
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      localStorage.setItem('userId', userId);
      
      // Set state
      setAccessTokenState(newAccessToken);
      setRefreshTokenState(newRefreshToken);
      
      // Set basic user data
      setCurrentUser({ id: userId });
      
      // Fetch full user data
      try {
        await fetchUserData(userId);
      } catch (error) {
        console.warn("Error fetching user details after login:", error);
        // Still return success, as we have the token and basic user info
      }
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Invalid email or password. Please try again.' 
      };
    }
  };

  const register = async (userData) => {
    try {
      console.log("Attempting registration with data:", { ...userData, password: "[REDACTED]" });
      
      const response = await axios.post('http://localhost:8080/api/auth/register', userData);
      
      console.log("Registration response:", response.data);
      
      const { accessToken: newAccessToken, refreshToken: newRefreshToken, userId } = response.data;
      
      if (!newAccessToken || !userId) {
        console.error("Missing required data in registration response:", response.data);
        return {
          success: false,
          message: "Invalid server response. Please try again."
        };
      }
      
      // Save tokens to localStorage
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      localStorage.setItem('userId', userId);
      
      // Set state
      setAccessTokenState(newAccessToken);
      setRefreshTokenState(newRefreshToken);
      
      // Set basic user data
      setCurrentUser({ id: userId });
      
      // Fetch full user data
      try {
        await fetchUserData(userId);
      } catch (error) {
        console.warn("Error fetching user details after registration:", error);
        // Still return success, as we have the token and basic user info
      }
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Email may already be in use.' 
      };
    }
  };

  const logout = () => {
    console.log("Logging out...");
    
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    
    // Clear state
    setCurrentUser(null);
    setAccessTokenState(null);
    setRefreshTokenState(null);
    
    // Redirect to login
    navigate('/login');
  };

  // Setup axios interceptors for authentication
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const tokenToUse = accessToken || localStorage.getItem('accessToken');
        
        if (tokenToUse) {
          config.headers.Authorization = `Bearer ${tokenToUse}`;
          console.log(`Adding token to ${config.url}`);
        } else {
          console.log(`No token available for request to ${config.url}`);
        }
        
        return config;
      },
      (error) => {
        console.error("Request interceptor error:", error);
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        console.log(`Response from ${response.config.url}: Status ${response.status}`);
        return response;
      },
      async (error) => {
        console.error(`Error response from ${error.config?.url}: Status ${error.response?.status}`);
        
        const originalRequest = error.config;
        
        // If error is 401 and we haven't already tried to refresh the token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await refreshAccessToken();
            // Retry with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh token failed, logout
            console.error("Token refresh failed:", refreshError);
            logout();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken]);

  const value = {
    currentUser,
    accessToken,
    refreshToken,
    isLoading,
    login,
    register,
    logout,
    fetchUserData,
    setAccessToken,     // Added for OAuth
    setRefreshToken,    // Added for OAuth
    setCurrentUser      // Added for OAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};