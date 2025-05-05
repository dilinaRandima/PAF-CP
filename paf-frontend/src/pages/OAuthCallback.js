import React, { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Spinner } from 'react-bootstrap';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentUser, setAccessToken, setRefreshToken } = useContext(AuthContext);
  
  useEffect(() => {
    const processOAuthCallback = async () => {
      // Get tokens from URL query parameters
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const refreshToken = params.get('refreshToken');
      const userId = params.get('userId');
      
      if (token && userId) {
        // Save tokens in localStorage
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userId', userId);
        
        // Update auth context
        setAccessToken(token);
        setRefreshToken(refreshToken);
        setCurrentUser({ id: userId });
        
        // Redirect to feed
        navigate('/feed');
      } else {
        // Handle error
        console.error('Invalid OAuth callback: missing tokens or userId');
        navigate('/login?error=oauth_failed');
      }
    };
    
    processOAuthCallback();
  }, [location, navigate, setCurrentUser, setAccessToken, setRefreshToken]);
  
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
      <div className="text-center">
        <Spinner animation="border" role="status" className="mb-3" />
        <h3>Completing login...</h3>
        <p className="text-muted">Please wait while we set up your account</p>
      </div>
    </div>
  );
};

export default OAuthCallback;