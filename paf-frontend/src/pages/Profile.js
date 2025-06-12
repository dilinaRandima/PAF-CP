import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Nav, Tab, Spinner, Alert } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { userService, profileService, postService } from '../api/apiService';
import { FaUserCircle, FaEdit, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import '../styles/Profile.css';

// Simple time ago formatter
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

const Profile = () => {
  const { userId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFriend, setIsFriend] = useState(false);
  
  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    fetchProfileData();
    // eslint-disable-next-line
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      // user data
      let userResponse;
      try {
        userResponse = await userService.getUserById(userId);
        setUser(userResponse.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setUser(null);
          setLoading(false);
          return;
        } else {
          throw err;
        }
      }
      // user profile data
      const profileResponse = await profileService.getProfileByUserId(userId);
      if (profileResponse.data && profileResponse.data.length > 0) {
        setUserProfile(profileResponse.data[0]);
      }
      // posts
      let postsResponse;
      try {
        postsResponse = await postService.getPostsByUserId(userId);
        setPosts(postsResponse.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setPosts([]);
        } else {
          throw err;
        }
      }
      setIsFriend(false);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('Failed to load profile data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFriendAction = async () => {
    try {
      // Would connect to your connections API
      // For now, just toggle the state
      setIsFriend(!isFriend);
      // Implement actual friend/unfriend logic here when ready
    } catch (err) {
      console.error('Error updating friend status:', err);
      alert('Failed to update friend status. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading profile...</span>
        </Spinner>
        <p className="mt-2">Loading profile data...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={fetchProfileData}>Try Again</Button>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="warning">User not found</Alert>
        <Link to="/" className="btn btn-primary mt-3">Go Home</Link>
      </Container>
    );
  }

  return (
    <div className="profile-background">
      <Container className="py-4 main-content-container">
        {/* Profile Header */}
        <Card className="custom-card mb-4">
          <Card.Body>
            <Row>
              <Col md={3} className="text-center mb-3 mb-md-0">
                {userProfile?.image ? (
                  <img 
                    src={userProfile.image} 
                    alt={`${user.username}'s avatar`} 
                    className="rounded-circle img-fluid" 
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                ) : (
                  <FaUserCircle size={150} className="text-secondary" />
                )}
              </Col>
              <Col md={9}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h2 className="mb-1">{user.username}</h2>
                    <p className="text-muted mb-3">
                      Member since {(
                        user.createdAt && !isNaN(new Date(user.createdAt).getTime())
                          ? new Date(user.createdAt).toLocaleDateString()
                          : 'Unknown'
                      )}
                    </p>
                  </div>
                  <div>
                    {isOwnProfile ? (
                      <Button 
                        as={Link} 
                        to="/edit-profile" 
                        variant="outline-primary"
                      >
                        <FaEdit className="me-2" /> Edit Profile
                      </Button>
                    ) : (
                      <Button 
                        variant={isFriend ? "outline-danger" : "outline-primary"}
                        onClick={handleFriendAction}
                      >
                        {isFriend ? (
                          <>
                            <FaUserMinus className="me-2" /> Unfriend
                          </>
                        ) : (
                          <>
                            <FaUserPlus className="me-2" /> Friend
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <h5>Bio</h5>
                  <p>{userProfile?.biography || 'No bio available'}</p>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        {/* Profile Content */}
        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Card className="custom-card">
            <Card.Header>
              <Nav variant="tabs">
                <Nav.Item>
                  <Nav.Link eventKey="posts">Posts</Nav.Link>
                </Nav.Item>
                {/* Add more tabs as needed */}
              </Nav>
            </Card.Header>
            <Card.Body>
              <Tab.Content>
                {/* Posts Tab */}
                <Tab.Pane eventKey="posts">
                  {posts.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted">No posts yet</p>
                      {isOwnProfile && (
                        <Button as={Link} to="/feed">Create your first post</Button>
                      )}
                    </div>
                  ) : (
                    <Row>
                      {posts.map(post => (
                        <Col md={6} key={post.id} className="mb-4">
                          <Card>
                            <Card.Body>
                              <Card.Text>{post.contentDescription}</Card.Text>
                              <small className="text-muted">
                                {formatTimeAgo(post.timestamp)}
                              </small>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Tab.Container>
      </Container>
    </div>
  );
};

export default Profile;