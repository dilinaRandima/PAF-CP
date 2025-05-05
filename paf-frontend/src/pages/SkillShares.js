import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { skillShareService, userService } from '../api/apiService';
import { FaPlus, FaTrash, FaEdit, FaShare } from 'react-icons/fa';

const SkillShares = () => {
  const { currentUser } = useContext(AuthContext);
  const [skillShares, setSkillShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState({});
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchSkillShares();
  }, []);

  const fetchSkillShares = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all skill shares
      const response = await skillShareService.getAllSkillShares();
      const fetchedSkillShares = response.data;
      
      setSkillShares(fetchedSkillShares);
      
      // Get unique user IDs to fetch user data
      const userIds = [...new Set(fetchedSkillShares.map(skill => skill.userId))];
      await fetchUsers(userIds);
      
    } catch (err) {
      console.error('Error fetching skill shares:', err);
      setError('Failed to load skill shares. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (userIds) => {
    const usersObject = { ...users };
    
    for (const userId of userIds) {
      if (!usersObject[userId]) {
        try {
          const response = await userService.getUserById(userId);
          usersObject[userId] = response.data;
        } catch (err) {
          console.error(`Error fetching user ${userId}:`, err);
          usersObject[userId] = { username: 'Unknown User' };
        }
      }
    }
    
    setUsers(usersObject);
  };

  const handleDeleteSkillShare = async (skillShareId) => {
    if (!window.confirm('Are you sure you want to delete this skill share?')) {
      return;
    }
    
    try {
      setDeleting(skillShareId);
      await skillShareService.deleteSkillShare(skillShareId);
      
      // Update state to remove deleted skill share
      setSkillShares(prevSkills => prevSkills.filter(skill => skill.id !== skillShareId));
    } catch (err) {
      console.error('Error deleting skill share:', err);
      alert('Failed to delete skill share. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading skill shares...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={fetchSkillShares}>Try Again</Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Skill Shares</h2>
        <Button 
          as={Link} 
          to="/create-skill-share" 
          variant="primary"
        >
          <FaPlus className="me-2" /> Share Your Skills
        </Button>
      </div>
      
      {skillShares.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <FaShare size={50} className="text-muted mb-3" />
            <h4>No Skill Shares Yet</h4>
            <p className="text-muted">Share your fitness knowledge and cooking skills with the community!</p>
            <Button 
              as={Link} 
              to="/create-skill-share" 
              variant="primary" 
              className="mt-3"
            >
              Create Your First Skill Share
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {skillShares.map(skill => (
            <Col lg={4} md={6} className="mb-4" key={skill.id}>
              <Card className="custom-card h-100">
                {skill.mediaUrls && skill.mediaUrls.length > 0 && (
                  <Card.Img 
                    variant="top" 
                    src={skill.mediaUrls[0]} 
                    alt={skill.mealDetails}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <Badge bg="success" className="px-2 py-1">
                      {skill.dietaryPreferences || 'General'}
                    </Badge>
                    {skill.userId === currentUser.id && (
                      <div className="dropdown">
                        <Button 
                          variant="link" 
                          className="text-decoration-none p-0 text-muted"
                          id={`dropdown-${skill.id}`}
                          data-bs-toggle="dropdown" 
                          aria-expanded="false"
                        >
                          ⋮
                        </Button>
                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby={`dropdown-${skill.id}`}>
                          <li>
                            <Link 
                              to={`/edit-skill-share/${skill.id}`} 
                              className="dropdown-item"
                            >
                              <FaEdit className="me-2" /> Edit
                            </Link>
                          </li>
                          <li>
                            <button 
                              className="dropdown-item text-danger"
                              onClick={() => handleDeleteSkillShare(skill.id)}
                              disabled={deleting === skill.id}
                            >
                              {deleting === skill.id ? (
                                <>
                                  <Spinner 
                                    as="span" 
                                    animation="border" 
                                    size="sm" 
                                    role="status" 
                                    aria-hidden="true" 
                                    className="me-2"
                                  />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <FaTrash className="me-2" /> Delete
                                </>
                              )}
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <Card.Title>{skill.mealDetails}</Card.Title>
                  
                  <Card.Text className="text-muted mb-2">
                    by {users[skill.userId]?.username || 'Unknown User'}
                  </Card.Text>
                  
                  <Card.Text className="ingredients-preview">
                    <strong>Ingredients:</strong> {skill.ingredients?.length > 100 ? 
                      `${skill.ingredients.substring(0, 100)}...` : 
                      skill.ingredients || 'No ingredients listed'}
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="bg-white">
                  <Button 
                    as={Link} 
                    to={`/skill-shares/${skill.id}`} 
                    variant="outline-primary" 
                    className="w-100"
                  >
                    View Details
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default SkillShares;