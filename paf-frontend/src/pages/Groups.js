import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { groupService, userService } from '../api/apiService';
import { FaUsers, FaPlus, FaSearch } from 'react-icons/fa';
import '../styles/Groups.css';

const Groups = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [publicGroups, setPublicGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    fetchGroups();
  }, [currentUser]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch public groups
      const publicResponse = await groupService.getPublicGroups();
      setPublicGroups(publicResponse.data);
      
      // Fetch user's groups
      const userResponse = await groupService.getGroupsByMember(currentUser.id);
      setUserGroups(userResponse.data);
      
      // Get unique user IDs from both group sets
      const allGroups = [...publicResponse.data, ...userResponse.data];
      const creatorIds = [...new Set(allGroups.map(group => group.creatorId))];
      
      // Fetch user data for group creators
      await fetchUsers(creatorIds);
      
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Failed to load groups. Please try again later.');
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

  const filteredPublicGroups = publicGroups.filter(group => 
    group.name.toLowerCase().includes(filterText.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(filterText.toLowerCase()))
  );

  const filteredUserGroups = userGroups.filter(group => 
    group.name.toLowerCase().includes(filterText.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(filterText.toLowerCase()))
  );

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading community groups...</p>
      </Container>
    );
  }

  return (
    <div className="groups-background">
      <Container className="py-4 main-content-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Cooking Communities</h2>
          <Button 
            as={Link} 
            to="/create-group" 
            variant="primary"
          >
            <FaPlus className="me-2" /> Create Group
          </Button>
        </div>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <div className="mb-4 position-relative search-bar-group">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search groups..."
            className="form-control search-input"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        
        {userGroups.length > 0 && (
          <>
            <h3 className="mb-3">Your Groups</h3>
            <Row className="mb-5">
              {filteredUserGroups.map(group => (
                <Col lg={4} md={6} className="mb-4" key={group.id}>
                  <Card className="h-100 custom-card">
                    {group.imageUrl && (
                      <Card.Img 
                        variant="top" 
                        src={group.imageUrl} 
                        alt={group.name}
                        style={{ height: '160px', objectFit: 'cover' }}
                      />
                    )}
                    <Card.Body>
                      <Card.Title>{group.name}</Card.Title>
                      <div className="text-muted mb-2">
                        Created by {users[group.creatorId]?.username || 'Unknown User'}
                      </div>
                      <Card.Text>
                        {group.description?.length > 100 
                          ? `${group.description.substring(0, 100)}...` 
                          : group.description}
                      </Card.Text>
                      <div className="mb-3">
                        <small className="text-muted">
                          {group.memberIds?.length || 0} members
                        </small>
                      </div>
                      {group.tags && group.tags.length > 0 && (
                        <div className="mb-3">
                          {group.tags.map((tag, index) => (
                            <Badge bg="secondary" className="me-1 mb-1" key={index}>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Card.Body>
                    <Card.Footer className="bg-white">
                      <Button 
                        as={Link} 
                        to={`/groups/${group.id}`} 
                        variant="outline-primary" 
                        className="w-100"
                      >
                        View Group
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
        
        <h3 className="mb-3">Discover Groups</h3>
        {filteredPublicGroups.length === 0 ? (
          <Card className="text-center p-5">
            <Card.Body>
              <FaUsers size={50} className="text-muted mb-3" />
              <h4>No Groups Found</h4>
              <p className="text-muted">Try clearing your search or create your own group!</p>
              <Button 
                as={Link} 
                to="/create-group" 
                variant="primary" 
                className="mt-3"
              >
                Create a Group
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {filteredPublicGroups.map(group => (
              <Col lg={4} md={6} className="mb-4" key={group.id}>
                <Card className="h-100 custom-card">
                  {group.imageUrl && (
                    <Card.Img 
                      variant="top" 
                      src={group.imageUrl} 
                      alt={group.name}
                      style={{ height: '160px', objectFit: 'cover' }}
                    />
                  )}
                  <Card.Body>
                    <Card.Title>{group.name}</Card.Title>
                    <div className="text-muted mb-2">
                      Created by {users[group.creatorId]?.username || 'Unknown User'}
                    </div>
                    <Card.Text>
                      {group.description?.length > 100 
                        ? `${group.description.substring(0, 100)}...` 
                        : group.description}
                    </Card.Text>
                    <div className="mb-3">
                      <small className="text-muted">
                        {group.memberIds?.length || 0} members
                      </small>
                    </div>
                    {group.tags && group.tags.length > 0 && (
                      <div className="mb-3">
                        {group.tags.map((tag, index) => (
                          <Badge bg="secondary" className="me-1 mb-1" key={index}>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                  <Card.Footer className="bg-white">
                    <Button 
                      as={Link} 
                      to={`/groups/${group.id}`} 
                      variant="outline-primary" 
                      className="w-100"
                    >
                      View Group
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default Groups;