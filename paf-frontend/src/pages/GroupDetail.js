import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, Nav, Tab, Badge, Modal } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { groupService, groupPostService, userService } from '../api/apiService';
import { 
  FaUsers, 
  FaUserPlus, 
  FaUserMinus, 
  FaTrash, 
  FaEdit, 
  FaCog, 
  FaInfoCircle, 
  FaEllipsisH,
  FaUserCircle  // Added this import
} from 'react-icons/fa';
import '../styles/GroupDetail.css';
import '../styles/group-rules-visibility-fix.css'; // Import the new group rules visibility CSS fix


const GroupDetail = () => {
  const { groupId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [newPost, setNewPost] = useState({ content: '', mediaUrl: '', mediaType: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  
  // Check if current user is a member
  const isMember = group?.memberIds?.includes(currentUser.id);
  // Check if current user is an admin
  const isAdmin = group?.adminIds?.includes(currentUser.id);
  // Check if current user is the creator
  const isCreator = group?.creatorId === currentUser.id;

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch group details
      const groupResponse = await groupService.getGroupById(groupId);
      setGroup(groupResponse.data);
      
      // Fetch group posts
      const postsResponse = await groupPostService.getPostsByGroupId(groupId);
      setPosts(postsResponse.data);
      
      // Get all user IDs from group and posts
      const userIds = [
        groupResponse.data.creatorId,
        ...groupResponse.data.memberIds,
        ...postsResponse.data.map(post => post.userId)
      ];
      
      // Fetch user data
      await fetchUsers([...new Set(userIds)]);
      
    } catch (err) {
      console.error('Error fetching group data:', err);
      setError('Failed to load group data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (userIds) => {
    const usersObject = { ...users };
    
    for (const userId of userIds) {
      if (!usersObject[userId] && userId) {
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

  const handleJoinGroup = async () => {
    if (!group) return;
    
    try {
      const updatedMembers = [...group.memberIds, currentUser.id];
      await groupService.updateGroupMembers(groupId, updatedMembers);
      
      // Update local state
      setGroup(prev => ({
        ...prev,
        memberIds: updatedMembers
      }));
    } catch (err) {
      console.error('Error joining group:', err);
      alert('Failed to join group. Please try again.');
    }
  };

  const handleLeaveGroup = async () => {
    if (!group || isCreator) return;
    
    if (!window.confirm('Are you sure you want to leave this group?')) {
      return;
    }
    
    try {
      const updatedMembers = group.memberIds.filter(id => id !== currentUser.id);
      const updatedAdmins = group.adminIds.filter(id => id !== currentUser.id);
      
      await groupService.updateGroupMembers(groupId, updatedMembers);
      
      if (isAdmin) {
        await groupService.updateGroupAdmins(groupId, updatedAdmins);
      }
      
      // Update local state
      setGroup(prev => ({
        ...prev,
        memberIds: updatedMembers,
        adminIds: updatedAdmins
      }));
    } catch (err) {
      console.error('Error leaving group:', err);
      alert('Failed to leave group. Please try again.');
    }
  };

  const handleDeleteGroup = async () => {
    if (!isCreator) return;
    
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }
    
    try {
      await groupService.deleteGroup(groupId);
      navigate('/groups');
    } catch (err) {
      console.error('Error deleting group:', err);
      alert('Failed to delete group. Please try again.');
    }
  };

  const handleNewPostChange = (e) => {
    const { name, value } = e.target;
    setNewPost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewPostSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPost.content) return;
    
    try {
      setSubmitting(true);
      
      const postData = {
        ...newPost,
        groupId,
        userId: currentUser.id
      };
      
      const response = await groupPostService.createPost(postData);
      
      // Add new post to the list
      setPosts(prev => [response.data, ...prev]);
      
      // Clear the form
      setNewPost({ content: '', mediaUrl: '', mediaType: '' });
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    try {
      await groupPostService.deletePost(postId);
      
      // Remove post from the list
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading group data...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={fetchGroupData}>Try Again</Button>
      </Container>
    );
  }

  if (!group) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Group not found</Alert>
        <Link to="/groups" className="btn btn-primary mt-3">Back to Groups</Link>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Group Header */}
      <Card className="custom-card mb-4">
        {group.imageUrl && (
          <div className="position-relative">
            <img 
              src={group.imageUrl} 
              alt={group.name} 
              className="img-fluid" 
              style={{ maxHeight: '300px', width: '100%', objectFit: 'cover' }}
            />
            <div className="position-absolute bottom-0 start-0 p-4 w-100" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
              <h1 className="text-white">{group.name}</h1>
            </div>
          </div>
        )}
        
        <Card.Body>
          {!group.imageUrl && <h1>{group.name}</h1>}
          
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <p className="text-muted">
                Created by {users[group.creatorId]?.username || 'Unknown User'} • {group.memberIds?.length || 0} members
              </p>
              {group.tags && group.tags.length > 0 && (
                <div className="mb-3">
                  {group.tags.map((tag, index) => (
                    <Badge bg="secondary" className="me-1 mb-1" key={index}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              {isMember ? (
                <Button 
                  variant="outline-danger" 
                  onClick={handleLeaveGroup}
                  disabled={isCreator}
                  title={isCreator ? "Creators cannot leave their groups" : "Leave group"}
                >
                  <FaUserMinus className="me-2" /> Leave
                </Button>
              ) : (
                <Button 
                  variant="outline-primary" 
                  onClick={handleJoinGroup}
                >
                  <FaUserPlus className="me-2" /> Join
                </Button>
              )}
              
              {isCreator && (
                <div className="dropdown d-inline-block ms-2">
                  <Button 
                    variant="outline-secondary" 
                    id="group-actions-dropdown"
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    <FaEllipsisH />
                  </Button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="group-actions-dropdown">
                    <li>
                      <Link to={`/edit-group/${groupId}`} className="dropdown-item">
                        <FaEdit className="me-2" /> Edit Group
                      </Link>
                    </li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleDeleteGroup}>
                        <FaTrash className="me-2" /> Delete Group
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {group.description && (
            <p className="mb-4">{group.description}</p>
          )}
        </Card.Body>
      </Card>

      {/* Group Content */}
      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Card className="custom-card">
          <Card.Header>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="posts">Posts</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="members">Members</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="about">About</Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          
          <Card.Body>
            <Tab.Content>
              {/* Posts Tab */}
              <Tab.Pane eventKey="posts">
                {isMember && (
                  <Card className="mb-4">
                    <Card.Body>
                      <h5 className="mb-3">Create a Post</h5>
                      <Form onSubmit={handleNewPostSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Share something with the group..."
                            name="content"
                            value={newPost.content}
                            onChange={handleNewPostChange}
                            required
                          />
                        </Form.Group>
                        
                        <Row>
                          <Col sm={8}>
                            <Form.Group className="mb-3">
                              <Form.Control
                                type="text"
                                placeholder="Media URL (optional)"
                                name="mediaUrl"
                                value={newPost.mediaUrl}
                                onChange={handleNewPostChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col sm={4}>
                            <Form.Group className="mb-3">
                              <Form.Select
                                name="mediaType"
                                value={newPost.mediaType}
                                onChange={handleNewPostChange}
                              >
                                <option value="">Media type...</option>
                                <option value="image/jpeg">Image</option>
                                <option value="video/mp4">Video</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <div className="text-end">
                          <Button 
                            type="submit" 
                            variant="primary"
                            disabled={submitting || !newPost.content}
                          >
                            {submitting ? 'Posting...' : 'Post'}
                          </Button>
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>
                )}
                
                {posts.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">No posts in this group yet</p>
                    {isMember && (
                      <p>Be the first to share something!</p>
                    )}
                  </div>
                ) : (
                  <div>
                    {posts.map(post => (
                      <Card key={post.id} className="mb-3">
                        <Card.Body>
                          <div className="d-flex justify-content-between mb-3">
                            <div className="d-flex">
                              <FaUserCircle size={40} className="text-secondary me-2" />
                              <div>
                                <h6 className="mb-0">{users[post.userId]?.username || 'Unknown User'}</h6>
                                <small className="text-muted">
                                  {new Date(post.timestamp).toLocaleString()}
                                </small>
                              </div>
                            </div>
                            
                            {(post.userId === currentUser.id || isAdmin || isCreator) && (
                              <Button 
                                variant="link" 
                                className="text-danger p-0" 
                                onClick={() => handleDeletePost(post.id)}
                              >
                                <FaTrash />
                              </Button>
                            )}
                          </div>
                          
                          <p>{post.content}</p>
                          
                          {post.mediaUrl && post.mediaType?.startsWith('image') && (
                            <img 
                              src={post.mediaUrl} 
                              alt="Post media" 
                              className="img-fluid rounded mb-3" 
                            />
                          )}
                          
                          {post.mediaUrl && post.mediaType?.startsWith('video') && (
                            <video 
                              src={post.mediaUrl} 
                              controls 
                              className="w-100 rounded mb-3" 
                            />
                          )}
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                )}
              </Tab.Pane>
              
              {/* Members Tab */}
              <Tab.Pane eventKey="members">
                <div className="d-flex justify-content-between mb-4">
                  <h4>Members ({group.memberIds?.length || 0})</h4>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => setShowMembersModal(true)}
                  >
                    <FaUsers className="me-2" /> View All
                  </Button>
                </div>
                
                <Row>
                  {group.memberIds?.slice(0, 8).map(memberId => (
                    <Col md={3} sm={6} className="mb-4" key={memberId}>
                      <Card className="text-center p-3">
                        <FaUserCircle size={60} className="mx-auto text-secondary mb-2" />
                        <h6>{users[memberId]?.username || 'Unknown User'}</h6>
                        {memberId === group.creatorId && (
                          <Badge bg="primary" className="mx-auto">Creator</Badge>
                        )}
                        {group.adminIds?.includes(memberId) && memberId !== group.creatorId && (
                          <Badge bg="info" className="mx-auto">Admin</Badge>
                        )}
                      </Card>
                    </Col>
                  ))}
                </Row>
                
                {group.memberIds?.length > 8 && (
                  <div className="text-center mt-3">
                    <Button 
                      variant="outline-secondary"
                      onClick={() => setShowMembersModal(true)}
                    >
                      View All Members
                    </Button>
                  </div>
                )}
              </Tab.Pane>
              
              {/* About Tab */}
              <Tab.Pane eventKey="about">
                <h4 className="mb-3">Group Rules</h4>
                {group.rules && group.rules.length > 0 ? (
                  <ul className="list-group mb-4">
                    {group.rules.map((rule, index) => (
                      <li key={index} className="list-group-item">
                        <FaInfoCircle className="text-primary me-2" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">No specific rules have been set for this group.</p>
                )}
                
                <h4 className="mb-3">About This Group</h4>
                <Card className="mb-4">
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <p><strong>Created:</strong> {new Date(group.createdAt).toLocaleDateString()}</p>
                        <p><strong>Creator:</strong> {users[group.creatorId]?.username || 'Unknown User'}</p>
                      </Col>
                      <Col md={6}>
                        <p><strong>Visibility:</strong> {group.isPublic ? 'Public' : 'Private'}</p>
                        <p><strong>Members:</strong> {group.memberIds?.length || 0}</p>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>
      
      {/* Members Modal */}
      <Modal 
        show={showMembersModal} 
        onHide={() => setShowMembersModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Group Members</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            {group.memberIds?.map(memberId => (
              <Col md={4} sm={6} className="mb-4" key={memberId}>
                <Card className="text-center p-3">
                  <FaUserCircle size={60} className="mx-auto text-secondary mb-2" />
                  <h6>{users[memberId]?.username || 'Unknown User'}</h6>
                  <div>
                    {memberId === group.creatorId && (
                      <Badge bg="primary" className="mx-1">Creator</Badge>
                    )}
                    {group.adminIds?.includes(memberId) && memberId !== group.creatorId && (
                      <Badge bg="info" className="mx-1">Admin</Badge>
                    )}
                  </div>
                  
                  {isCreator && memberId !== currentUser.id && (
                    <div className="mt-2">
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => {
                          // Handle remove member logic
                          if (window.confirm(`Remove ${users[memberId]?.username || 'this user'} from the group?`)) {
                            // Implementation goes here
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default GroupDetail;