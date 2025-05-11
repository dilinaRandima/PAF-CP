import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { FaGoogle, FaUtensils, FaUser, FaLock, FaEnvelope } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear previous errors
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Registration data - using email instead of username to match backend expectations
    const userData = {
      email: formData.email,
      password: formData.password
    };

    try {
      const result = await register(userData);
      
      if (result.success) {
        navigate('/feed');
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'An error occurred during registration. Please try again.');
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
                <h2 className="auth-title">Create an Account</h2>
                
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
                      name="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleChange}
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
                      name="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="ps-5"
                    />
                    <Form.Text className="text-muted">
                      Password must be at least 6 characters long
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4 position-relative">
                    <div className="input-icon">
                      <FaLock className="text-primary" />
                    </div>
                    <Form.Control 
                      type="password" 
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="ps-5"
                    />
                  </Form.Group>

                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 mt-3 btn-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating Account...
                      </span>
                    ) : (
                      'Register'
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
                      Already have an account? <Link to="/login" className="text-primary fw-bold">Login</Link>
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Add custom styles for the Register page */}
      <style jsx>{`
        .auth-page {
          background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), 
                            url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80');
          background-size: cover;
          background-position: center;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .app-logo {
          margin-bottom: 2rem;
        }
        
        .auth-card {
          border: none;
          border-radius: 15px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.2);
          background-color: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
        }
        
        .auth-title {
          color: var(--primary-dark);
          font-size: 2rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 1.5rem;
          font-family: 'Playfair Display', serif;
        }
        
        .divider {
          display: flex;
          align-items: center;
          color: var(--text-secondary);
        }
        
        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background-color: var(--neutral-medium);
        }
        
        .divider span {
          padding: 0 1rem;
        }
        
        .input-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
        }
        
        /* Animation for error message */
        @keyframes headShake {
          0% {
            transform: translateX(0);
          }
          6.5% {
            transform: translateX(-6px) rotateY(-9deg);
          }
          18.5% {
            transform: translateX(5px) rotateY(7deg);
          }
          31.5% {
            transform: translateX(-3px) rotateY(-5deg);
          }
          43.5% {
            transform: translateX(2px) rotateY(3deg);
          }
          50% {
            transform: translateX(0);
          }
        }
        
        .animate__headShake {
          animation-name: headShake;
          animation-duration: 0.8s;
          animation-timing-function: ease-in-out;
        }
        
        .animate__animated {
          animation-duration: 1s;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
};

export default Register;