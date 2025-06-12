import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { profileService } from '../api/apiService';
import { FaUserCircle, FaSave } from 'react-icons/fa';
import '../styles/EditProfile.css';

const EditProfile = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    userId: '',
    image: '',
    biography: '',
    fitnessGoals: '',
    profileVisibility: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
    }
  }, [currentUser]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await profileService.getProfileByUserId(currentUser.id);
      
      if (response.data && response.data.length > 0) {
        // Profile exists, set form data
        const profile = response.data[0];
        setUserProfile(profile);
        setProfileData({
          userId: profile.userId || currentUser.id,
          image: profile.image || '',
          biography: profile.biography || '',
          fitnessGoals: profile.fitnessGoals || '',
          profileVisibility: profile.profileVisibility !== false
        });
      } else {
        // No profile exists yet, initialize with user ID
        setProfileData({
          ...profileData,
          userId: currentUser.id
        });
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData({
      ...profileData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear success message on form change
    if (success) {
      setSuccess(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    
    try {
      if (userProfile) {
        // Update existing profile
        await profileService.updateProfile(userProfile.id, profileData);
      } else {
        // Create new profile
        await profileService.createProfile(profileData);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate(`/profile/${currentUser.id}`);
      }, 1500);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading profile data...</p>
      </Container>
    );
  }

  return (
    <div className="editprofile-background">
      <Container className="py-4 main-content-container">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="custom-card">
              <Card.Body>
                <h2 className="mb-4">Edit Your Profile</h2>
                
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">Profile saved successfully!</Alert>}
                
                <Form onSubmit={handleSubmit}>
                  <Row className="mb-4">
                    <Col md={4} className="text-center">
                      {profileData.image ? (
                        <img 
                          src={profileData.image} 
                          alt="Profile preview" 
                          className="rounded-circle img-fluid mb-3" 
                          style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        />
                      ) : (
                        <FaUserCircle size={150} className="text-secondary mb-3" />
                      )}
                    </Col>
                    
                    <Col md={8}>
                      <Form.Group className="mb-3">
                        <Form.Label>Profile Image URL</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="image" 
                          value={profileData.image} 
                          onChange={handleChange}
                          placeholder="Enter URL for your profile image"
                        />
                        <Form.Text className="text-muted">
                          Enter a URL to an image for your profile picture
                        </Form.Text>
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Check 
                          type="checkbox" 
                          name="profileVisibility" 
                          checked={profileData.profileVisibility} 
                          onChange={handleChange}
                          label="Make profile public (visible to everyone)" 
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Bio</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={3} 
                      name="biography" 
                      value={profileData.biography} 
                      onChange={handleChange}
                      placeholder="Tell us about yourself"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Cooking Goals</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={3} 
                      name="fitnessGoals" 
                      value={profileData.fitnessGoals} 
                      onChange={handleChange}
                      placeholder="What are your fitness goals?"
                    />
                  </Form.Group>
                  
                  <div className="d-flex justify-content-between">
                    <Button 
                      variant="secondary" 
                      onClick={() => navigate(`/profile/${currentUser.id}`)}
                    >
                      Cancel
                    </Button>
                    
                    <Button 
                      type="submit" 
                      variant="primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Spinner 
                            as="span" 
                            animation="border" 
                            size="sm" 
                            role="status" 
                            aria-hidden="true" 
                            className="me-2"
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave className="me-2" /> Save Profile
                        </>
                      )}
                    </Button>
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

export default EditProfile;