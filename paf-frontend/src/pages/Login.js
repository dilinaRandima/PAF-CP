import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { FaGoogle, FaUtensils, FaEnvelope, FaLock } from 'react-icons/fa';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for OAuth error
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthError = params.get('error');
    if (oauthError === 'oauth_failed') {
      setError('Google login failed. Please try again.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }
    
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/feed');
      } else {
        setError(result.message || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = () => {
    // Redirect to Spring OAuth2 endpoint
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <div className="auth-page">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <div className="text-center mb-4 app-logo">
              <FaUtensils size={50} className="text-primary" />
              <h1 className="mt-2 text-white">CookBook</h1>
              <p className="text-white-50">Your culinary journey begins here</p>
            </div>
            
            <Card className="auth-card">
              <Card.Body className="p-4">
                <h2 className="auth-title">Welcome Back</h2>
                
                {error && (
                  <Alert variant="danger" className="animate__animated animate__headShake">
                    {error}
                  </Alert>
                )}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4 position-relative">
                    <div className="input-icon">
                      <FaEnvelope className="text-primary" />
                    </div>
                    <Form.Control
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="ps-5"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-4 position-relative">
                    <div className="input-icon">
                      <FaLock className="text-primary" />
                    </div>
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="ps-5"
                    />
                  </Form.Group>
                  
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <Form.Check 
                      type="checkbox" 
                      id="rememberMe"
                      label="Remember me" 
                      className="custom-control custom-checkbox"
                    />
                    <a href="#" className="text-primary forgot-password">Forgot password?</a>
                  </div>
                  
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 mb-3 btn-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Logging in...
                      </span>
                    ) : (
                      'Log In'
                    )}
                  </Button>
                  
                  <div className="divider my-4">
                    <span>OR</span>
                  </div>
                  
                  <Button 
                    variant="light" 
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={handleGoogleLogin}
                  >
                    <FaGoogle className="text-danger me-2" size={20} /> 
                    Continue with Google
                  </Button>
                  
                  <div className="text-center mt-4">
                    <p className="mb-0">
                      Don't have an account? <Link to="/register" className="text-primary fw-bold">Create Account</Link>
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;