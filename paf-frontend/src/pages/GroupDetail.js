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
  FaInfoCircle,
  FaEllipsisH,
  FaUserCircle
} from 'react-icons/fa';

const GroupDetail = () => {
  // Get URL params and context
  const { groupId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Main state
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [newPost, setNewPost] = useState({ content: '', mediaUrl: '', mediaType: '' });
  const [showMembersModal, setShowMembersModal] = useState(false);
  
  // Loading states
  const [isActionLoading, setIsActionLoading] = useState({});
  
  // User role checks
  const isMember = group?.memberIds?.includes(currentUser.id);
  const isAdmin = group?.adminIds?.includes(currentUser.id);
  const isCreator = group?.creatorId === currentUser.id;

  // Fetch data on component mount
  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  // Main data fetching function
  const fetchGroupData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get group data
      const groupResponse = await groupService.getGroupById(groupId);
      setGroup(groupResponse.data);
      
      // Get posts
      const postsResponse = await groupPostService.getPostsByGroupId(groupId);
      setPosts(postsResponse.data);
      
      // Get all user IDs we need to fetch
      const userIds = [
        groupResponse.data.creatorId,
        ...groupResponse.data.memberIds,
        ...postsResponse.data.map(post => post.userId)
      ];
      
      // Fetch user data
      await fetchUsers([...new Set(userIds)]);
      
    } catch (err) {
      handleError(err, 'Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  // Error handling helper
  const handleError = (error, defaultMessage = 'An error occurred') => {
    console.error(`${defaultMessage}:`, error);
    
    let message = defaultMessage;
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.request) {
      message = 'Network error. Please check your connection.';
    }
    
    setError({ variant: 'danger', message });
    setTimeout(() => setError(null), 5000);
  };

  // Show success message helper
  const showSuccess = (message) => {
    setError({ variant: 'success', message });
    setTimeout(() => setError(null), 3000);
  };

  // Set loading state for an action
  const setActionLoading = (action, isLoading) => {
    setIsActionLoading(prev => ({ ...prev, [action]: isLoading }));
  };

  // Fetch users helper
  const fetchUsers = async (userIds) => {
    const missingUserIds = userIds.filter(id => id && !users[id]);
    
    if (missingUserIds.length === 0) return;
    
    try {
      const batchSize = 20;
      let newUsers = { ...users };
      
      for (let i = 0; i < missingUserIds.length; i += batchSize) {
        const batch = missingUserIds.slice(i, i + batchSize);
        
        try {
          // Try batch API first
          const response = await userService.getUsersByIds(batch);
          Object.assign(newUsers, response.data);
        } catch (err) {
          // Fall back to individual requests
          await Promise.all(
            batch.map(async (userId) => {
              try {
                const response = await userService.getUserById(userId);
                newUsers[userId] = response.data;
              } catch (err) {
                newUsers[userId] = { username: 'Unknown User' };
              }
            })
          );
        }
      }
      
      setUsers(newUsers);
    } catch (err) {
      handleError(err, 'Error fetching user data');
    }
  };

  // Join group handler
  const handleJoinGroup = async () => {
    if (!group) return;
    
    try {
      setActionLoading('join', true);
      
      const updatedMembers = [...group.memberIds, currentUser.id];
      await groupService.updateGroupMembers(groupId, updatedMembers);
      
      setGroup(prev => ({ ...prev, memberIds: updatedMembers }));
      showSuccess('Successfully joined the group');
    } catch (err) {
      handleError(err, 'Failed to join group');
    } finally {
      setActionLoading('join', false);
    }
  };

  // Leave group handler
  const handleLeaveGroup = async () => {
    if (!group || isCreator) return;
    
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    
    try {
      setActionLoading('leave', true);
      
      const updatedMembers = group.memberIds.filter(id => id !== currentUser.id);
      const updatedAdmins = group.adminIds.filter(id => id !== currentUser.id);
      
      await groupService.updateGroupMembers(groupId, updatedMembers);
      
      if (isAdmin) {
        await groupService.updateGroupAdmins(groupId, updatedAdmins);
      }
      
      setGroup(prev => ({
        ...prev,
        memberIds: updatedMembers,
        adminIds: updatedAdmins
      }));
      
      showSuccess('Successfully left the group');
    } catch (err) {
      handleError(err, 'Failed to leave group');
    } finally {
      setActionLoading('leave', false);
    }
  };

  // Remove member handler
  const handleRemoveMember = async (memberId) => {
    if (!isCreator || memberId === currentUser.id) return;
    
    try {
      setActionLoading(`remove_${memberId}`, true);
      
      const updatedMembers = group.memberIds.filter(id => id !== memberId);
      const updatedAdmins = group.adminIds.filter(id => id !== memberId);
      
      await groupService.updateGroupMembers(groupId, updatedMembers);
      
      if (group.adminIds.includes(memberId)) {
        await groupService.updateGroupAdmins(groupId, updatedAdmins);
      }
      
      setGroup(prev => ({
        ...prev,
        memberIds: updatedMembers,
        adminIds: updatedAdmins
      }));
      
      showSuccess('Member removed successfully');
    } catch (err) {
      handleError(err, 'Failed to remove member');
    } finally {
      setActionLoading(`remove_${memberId}`, false);
    }
  };

  // Toggle admin status handler
  const handleToggleAdmin = async (memberId, makeAdmin) => {
    if (!isCreator || memberId === currentUser.id) return;
    
    const actionName = makeAdmin ? 'make_admin' : 'remove_admin';
    
    try {
      setActionLoading(`${actionName}_${memberId}`, true);
      
      let updatedAdmins;
      if (makeAdmin) {
        updatedAdmins = [...group.adminIds, memberId];
      } else {
        updatedAdmins = group.adminIds.filter(id => id !== memberId);
      }
      
      await groupService.updateGroupAdmins(groupId, updatedAdmins);
      
      setGroup(prev => ({
        ...prev,
        adminIds: updatedAdmins
      }));
      
      showSuccess(makeAdmin ? 'Admin added successfully' : 'Admin removed successfully');
    } catch (err) {
      handleError(err, makeAdmin ? 'Failed to add admin' : 'Failed to remove admin');
    } finally {
      setActionLoading(`${actionName}_${memberId}`, false);
    }
  };

  // Delete group handler
  const handleDeleteGroup = async () => {
    if (!isCreator) return;
    
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    
    try {
      setActionLoading('delete', true);
      await groupService.deleteGroup(groupId);
      navigate('/groups');
    } catch (err) {
      handleError(err, 'Failed to delete group');
      setActionLoading('delete', false);
    }
  };

  // New post form change handler
  const handlePostInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost(prev => ({ ...prev, [name]: value }));
  };

  // Submit new post handler
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    
    if (!newPost.content) return;
    
    try {
      setActionLoading('post', true);
      
      const postData = {
        ...newPost,
        groupId,
        userId: currentUser.id
      };
      
      const response = await groupPostService.createPost(postData);
      
      setPosts(prev => [response.data, ...prev]);
      setNewPost({ content: '', mediaUrl: '', mediaType: '' });
      
      showSuccess('Post created successfully');
    } catch (err) {
      handleError(err, 'Failed to create post');
    } finally {
      setActionLoading('post', false);
    }
  };

  // Delete post handler
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      setActionLoading(`delete_post_${postId}`, true);
      
      await groupPostService.deletePost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
      
      showSuccess('Post deleted successfully');
    } catch (err) {
      handleError(err, 'Failed to delete post');
    } finally {
      setActionLoading(`delete_post_${postId}`, false);
    }
  };

  // Loading state component
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

  // Group not found state
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
      {/* Error/Success Message */}
      {error && (
        <Alert 
          variant={error.variant || "danger"} 
          dismissible 
          onClose={() => setError(null)}
          className="mb-4"
        >
          {error.message || error}
        </Alert>
      )}
      
      {/* Group Header Card */}
      <Card className="mb-4">
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
              {group.tags?.length > 0 && (
                <div className="mb-3">
                  {group.tags.map((tag, index) => (
                    <Badge bg="secondary" className="me-1 mb-1" key={index}>{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              {/* Join/Leave Button */}
              {isMember ? (
                <Button 
                  variant="outline-danger" 
                  onClick={handleLeaveGroup}
                  disabled={isCreator || isActionLoading.leave}
                  title={isCreator ? "Creators cannot leave their groups" : "Leave group"}
                >
                  {isActionLoading.leave ? (
                    <><Spinner as="span" animation="border" size="sm" className="me-2" /> Leaving...</>
                  ) : (
                    <><FaUserMinus className="me-2" /> Leave</>
                  )}
                </Button>
              ) : (
                <Button 
                  variant="outline-primary" 
                  onClick={handleJoinGroup}
                  disabled={isActionLoading.join}
                >
                  {isActionLoading.join ? (
                    <><Spinner as="span" animation="border" size="sm" className="me-2" /> Joining...</>
                  ) : (
                    <><FaUserPlus className="me-2" /> Join</>
                  )}
                </Button>
              )}
              
              {/* Group Admin Actions */}
              {isCreator && (
                <div className="dropdown d-inline-block ms-2">
                  <Button 
                    variant="outline-secondary" 
                    id="group-actions-dropdown"
                    data-bs-toggle="dropdown" 
                  >
                    <FaEllipsisH />
                  </Button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link to={`/edit-group/${groupId}`} className="dropdown-item">
                        <FaEdit className="me-2" /> Edit Group
                      </Link>
                    </li>
                    <li>
                      <button 
                        className="dropdown-item text-danger" 
                        onClick={handleDeleteGroup}
                        disabled={isActionLoading.delete}
                      >
                        {isActionLoading.delete ? (
                          <><Spinner as="span" animation="border" size="sm" className="me-2" /> Deleting...</>
                        ) : (
                          <><FaTrash className="me-2" /> Delete Group</>
                        )}
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {/* Group Description */}
          {group.description && <p className="mb-0">{group.description}</p>}
        </Card.Body>
      </Card>

      {/* Group Content Tabs */}
      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Card>
          <Card.Header>
            <Nav variant="tabs">
              <Nav.Item><Nav.Link eventKey="posts">Posts</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="members">Members</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="about">About</Nav.Link></Nav.Item>
            </Nav>
          </Card.Header>
          
          <Card.Body>
            <Tab.Content>
              {/* Posts Tab */}
              <Tab.Pane eventKey="posts">
                {/* New Post Form for Members */}
                {isMember && (
                  <Card className="mb-4">
                    <Card.Body>
                      <h5 className="mb-3">Create a Post</h5>
                      <Form onSubmit={handleSubmitPost}>
                        <Form.Group className="mb-3">
                          <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Share something with the group..."
                            name="content"
                            value={newPost.content}
                            onChange={handlePostInputChange}
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
                                onChange={handlePostInputChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col sm={4}>
                            <Form.Group className="mb-3">
                              <Form.Select
                                name="mediaType"
                                value={newPost.mediaType}
                                onChange={handlePostInputChange}
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
                            disabled={isActionLoading.post || !newPost.content}
                          >
                            {isActionLoading.post ? (
                              <><Spinner as="span" animation="border" size="sm" className="me-2" /> Posting...</>
                            ) : 'Post'}
                          </Button>
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>
                )}
                
                {/* Post List */}
                {posts.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">No posts in this group yet</p>
                    {isMember && <p>Be the first to share something!</p>}
                  </div>
                ) : (
                  <div>
                    {posts.map(post => {
                      const isPostDeleting = isActionLoading[`delete_post_${post.id}`];
                      return (
                        <Card key={post.id} className="mb-3">
                          <Card.Body>
                            {/* Post Header */}
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
                              
                              {/* Delete Post Button */}
                              {(post.userId === currentUser.id || isAdmin || isCreator) && (
                                <Button 
                                  variant="link" 
                                  className="text-danger p-0" 
                                  onClick={() => handleDeletePost(post.id)}
                                  disabled={isPostDeleting}
                                >
                                  {isPostDeleting ? (
                                    <Spinner as="span" animation="border" size="sm" />
                                  ) : (
                                    <FaTrash />
                                  )}
                                </Button>
                              )}
                            </div>
                            
                            {/* Post Content */}
                            <p>{post.content}</p>
                            
                            {/* Post Media */}
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
                      );
                    })}
                  </div>
                )}
              </Tab.Pane>
              
              {/* Members Tab */}
              <Tab.Pane eventKey="members">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="mb-0">Members ({group.memberIds?.length || 0})</h4>
                  <Button 
                    variant="outline-primary" 
                    onClick={() => setShowMembersModal(true)}
                  >
                    <FaUsers className="me-2" /> View All Members
                  </Button>
                </div>
                
                <Row className="g-3">
                  {group.memberIds?.length === 0 ? (
                    <Col xs={12}>
                      <div className="text-center py-4">
                        <p className="text-muted">This group has no members yet.</p>
                      </div>
                    </Col>
                  ) : (
                    group.memberIds?.slice(0, 8).map(memberId => (
                      <Col lg={3} md={4} sm={6} xs={12} key={memberId}>
                        <Card className="h-100 text-center p-3">
                          <FaUserCircle size={50} className="mx-auto text-secondary mb-2" />
                          <h6 className="text-truncate" style={{ maxWidth: '90%', margin: '0 auto' }}>
                            {users[memberId]?.username || 'Unknown User'}
                          </h6>
                          <div className="mt-2">
                            {memberId === group.creatorId && (
                              <Badge bg="primary" className="mx-auto">Creator</Badge>
                            )}
                            {group.adminIds?.includes(memberId) && memberId !== group.creatorId && (
                              <Badge bg="info" className="mx-auto">Admin</Badge>
                            )}
                          </div>
                        </Card>
                      </Col>
                    ))
                  )}
                </Row>
                
                {group.memberIds?.length > 8 && (
                  <div className="text-center mt-4">
                    <Button 
                      variant="outline-secondary"
                      onClick={() => setShowMembersModal(true)}
                    >
                      View All {group.memberIds.length} Members
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
                        <FaInfoCircle className="text-primary me-2" />{rule}
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
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Group Members ({group.memberIds?.length || 0})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          {group.memberIds?.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">This group has no members yet.</p>
            </div>
          ) : (
            <Row className="g-3">
              {group.memberIds?.map(memberId => {
                const isRemoving = isActionLoading[`remove_${memberId}`];
                const isMakingAdmin = isActionLoading[`make_admin_${memberId}`];
                const isRemovingAdmin = isActionLoading[`remove_admin_${memberId}`];
                
                return (
                  <Col lg={4} md={6} sm={12} key={memberId}>
                    <Card className="h-100">
                      <Card.Body className="d-flex flex-column align-items-center p-3">
                        <div className="d-flex align-items-center w-100 mb-2">
                          <FaUserCircle size={50} className="text-secondary me-3" />
                          <div className="flex-grow-1">
                            <h6 className="mb-0 text-truncate" style={{ maxWidth: '150px' }}>
                              {users[memberId]?.username || 'Unknown User'}
                            </h6>
                            <div className="mt-1">
                              {memberId === group.creatorId && (
                                <Badge bg="primary" className="me-1">Creator</Badge>
                              )}
                              {group.adminIds?.includes(memberId) && memberId !== group.creatorId && (
                                <Badge bg="info" className="me-1">Admin</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Admin Actions */}
                        {isCreator && memberId !== currentUser.id && (
                          <div className="mt-2 d-flex w-100 justify-content-end">
                            {group.adminIds?.includes(memberId) && memberId !== group.creatorId ? (
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                className="me-2"
                                onClick={() => {
                                  if (window.confirm(`Remove admin status from ${users[memberId]?.username || 'this user'}?`)) {
                                    handleToggleAdmin(memberId, false);
                                  }
                                }}
                                disabled={isRemovingAdmin}
                              >
                                {isRemovingAdmin ? 'Updating...' : 'Remove Admin'}
                              </Button>
                            ) : memberId !== group.creatorId && (
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                className="me-2"
                                onClick={() => {
                                  if (window.confirm(`Make ${users[memberId]?.username || 'this user'} an admin?`)) {
                                    handleToggleAdmin(memberId, true);
                                  }
                                }}
                                disabled={isMakingAdmin}
                              >
                                {isMakingAdmin ? 'Updating...' : 'Make Admin'}
                              </Button>
                            )}
                            
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => {
                                if (window.confirm(`Remove ${users[memberId]?.username || 'this user'} from the group?`)) {
                                  handleRemoveMember(memberId);
                                }
                              }}
                              disabled={isRemoving}
                            >
                              {isRemoving ? 'Removing...' : 'Remove'}
                            </Button>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMembersModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GroupDetail;