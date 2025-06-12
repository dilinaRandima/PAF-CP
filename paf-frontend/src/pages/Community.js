import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { userService } from '../api/apiService';
import '../styles/Community.css'; // Import the new CSS file

const Community = () => {
  const { currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading community...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger">{error}</div>
        <Button onClick={fetchUsers}>Try Again</Button>
      </Container>
    );
  }

  return (
    <div className="community-background">
      <Container className="py-4 main-content-container">
        <h2>Community</h2>
        <Row>
          {users.map(user => (
            <Col lg={4} md={6} className="mb-4" key={user.id}>
              <Card className="user-card">
                <Card.Header className="user-card-header">
                  <h5 className="user-name">{user.username || user.email.split('@')[0]}</h5>
                </Card.Header>
                <Card.Body className="user-card-content">
                  <p className="user-bio">{user.bio || 'No bio available.'}</p>
                  <div className="user-stats">
                    <div className="user-stat">
                      <div className="user-stat-value">{user.postsCount || 0}</div>
                      <div className="user-stat-label">Posts</div>
                    </div>
                    <div className="user-stat">
                      <div className="user-stat-value">{user.followersCount || 0}</div>
                      <div className="user-stat-label">Followers</div>
                    </div>
                    <div className="user-stat">
                      <div className="user-stat-value">{user.followingCount || 0}</div>
                      <div className="user-stat-label">Following</div>
                    </div>
                  </div>
                  <Button variant="primary" className="user-action-btn">Follow</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default Community; 