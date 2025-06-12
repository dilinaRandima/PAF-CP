import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, Modal, Badge } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { bookmarkService, postService } from '../api/apiService';
import { FaBookmark, FaEdit, FaTrash, FaPlus, FaTimes, FaTags, FaSave } from 'react-icons/fa';
import '../styles/Bookmarks.css';

const Bookmarks = () => {
  const { currentUser } = useContext(AuthContext);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    resourceId: '',
    resourceType: 'external',
    note: '',
    tags: ''
  });
  const [postPreviews, setPostPreviews] = useState({});
  const [expandedCards, setExpandedCards] = useState({});
  const [expandedIngredients, setExpandedIngredients] = useState({});
  const [expandedInstructions, setExpandedInstructions] = useState({});

  // Add a shared media style for images and videos
  const mediaStyle = { width: '100%', aspectRatio: '16/9', objectFit: 'cover', maxHeight: 260, borderRadius: 12, background: '#f8f8f8' };

  useEffect(() => {
    if (currentUser?.id) {
      fetchBookmarks();
    }
  }, [currentUser]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await bookmarkService.getUserBookmarks(currentUser.id);
      setBookmarks(response.data);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError('Failed to load bookmarks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch post previews for post-type bookmarks
  useEffect(() => {
    const fetchPreviews = async () => {
      const previews = {};
      const postBookmarks = bookmarks.filter(b => b.resourceType === 'post');
      for (const b of postBookmarks) {
        try {
          const res = await postService.getPostById(b.resourceId);
          previews[b.resourceId] = res.data;
        } catch (err) {
          previews[b.resourceId] = null;
        }
      }
      setPostPreviews(previews);
    };
    if (bookmarks.length > 0) fetchPreviews();
  }, [bookmarks]);

  const handleModalClose = () => {
    setShowModal(false);
    setEditingBookmark(null);
    setFormData({
      title: '',
      resourceId: '',
      resourceType: 'external',
      note: '',
      tags: ''
    });
  };

  const handleModalShow = (bookmark = null) => {
    if (bookmark) {
      setEditingBookmark(bookmark);
      setFormData({
        title: bookmark.title || '',
        resourceId: bookmark.resourceId || '',
        resourceType: bookmark.resourceType || 'external',
        note: bookmark.note || '',
        tags: bookmark.tags ? bookmark.tags.join(', ') : ''
      });
    }
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];
      
      const bookmarkData = {
        ...formData,
        userId: currentUser.id,
        tags: tagsArray
      };
      
      if (editingBookmark) {
        // Update existing bookmark
        await bookmarkService.updateBookmark(editingBookmark.id, bookmarkData);
      } else {
        // Create new bookmark
        await bookmarkService.createBookmark(bookmarkData);
      }
      
      fetchBookmarks();
      handleModalClose();
    } catch (err) {
      console.error('Error saving bookmark:', err);
      setError('Failed to save bookmark. Please try again.');
    }
  };

  const handleDelete = async (bookmarkId) => {
    if (!window.confirm('Are you sure you want to delete this bookmark?')) {
      return;
    }
    
    try {
      await bookmarkService.deleteBookmark(bookmarkId);
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId));
    } catch (err) {
      console.error('Error deleting bookmark:', err);
      setError('Failed to delete bookmark. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading bookmarks...</p>
      </Container>
    );
  }

  return (
    <div className="bookmarks-background">
      <Container className="py-4 main-content-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>My Saved Resources</h2>
          <Button 
            variant="primary" 
            onClick={() => handleModalShow()}
          >
            <FaPlus className="me-2" /> Add Bookmark
          </Button>
        </div>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        {bookmarks.length === 0 ? (
          <Card className="text-center p-5">
            <Card.Body>
              <FaBookmark size={50} className="text-muted mb-3" />
              <h4>No Bookmarks Yet</h4>
              <p className="text-muted">Save recipes, tutorials, or other cooking resources to access them later!</p>
              <Button 
                variant="primary" 
                className="mt-3"
                onClick={() => handleModalShow()}
              >
                Add Your First Bookmark
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {bookmarks.map(bookmark => {
              const post = postPreviews[bookmark.resourceId];
              const isDescExpanded = expandedCards[bookmark.id];
              const isIngredientsExpanded = expandedIngredients[bookmark.id];
              const isInstructionsExpanded = expandedInstructions[bookmark.id];
              const toggleDescExpand = () => setExpandedCards(prev => ({ ...prev, [bookmark.id]: !prev[bookmark.id] }));
              const toggleIngredientsExpand = () => setExpandedIngredients(prev => ({ ...prev, [bookmark.id]: !prev[bookmark.id] }));
              const toggleInstructionsExpand = () => setExpandedInstructions(prev => ({ ...prev, [bookmark.id]: !prev[bookmark.id] }));
              return (
                <Col lg={4} md={6} className="mb-4" key={bookmark.id}>
                  <Card className="h-100 custom-card">
                    <Card.Body style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div className="d-flex justify-content-between mb-3">
                        <h5 className="card-title" style={{ fontSize: '1.2rem', marginBottom: 0 }}>{bookmark.title}</h5>
                        <div>
                          <Button 
                            variant="link" 
                            className="p-0 text-primary me-2" 
                            onClick={() => handleModalShow(bookmark)}
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="link" 
                            className="p-0 text-danger" 
                            onClick={() => handleDelete(bookmark.id)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </div>
                      {bookmark.resourceType === 'external' ? (
                        <a 
                          href={bookmark.resourceId} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-outline-primary btn-sm mb-3"
                        >
                          Visit Resource
                        </a>
                      ) : (
                        <>
                          {post && (
                            (() => {
                              if (post.mediaLinks && post.mediaLinks.length > 0) {
                                const url = post.mediaLinks[0];
                                const type = post.mediaTypes && post.mediaTypes[0];
                                if (type && type.includes('image')) {
                                  return <img src={url} alt={post.title} className="img-fluid rounded mb-2" style={mediaStyle} />;
                                } else if (type && type.includes('video')) {
                                  return <video src={url} controls className="w-100 rounded mb-2" style={mediaStyle} />;
                                }
                              } else if (post.mediaLink && post.mediaType?.includes('image')) {
                                return <img src={post.mediaLink} alt={post.title} className="img-fluid rounded mb-2" style={mediaStyle} />;
                              } else if (post.mediaLink && post.mediaType?.includes('video')) {
                                return <video src={post.mediaLink} controls className="w-100 rounded mb-2" style={mediaStyle} />;
                              }
                              return null;
                            })()
                          )}
                          {/* Show ingredients if available */}
                          {post?.ingredients && post.ingredients.length > 0 && (
                            <div className="mt-2">
                              <h6 style={{ fontSize: '1em', marginBottom: 4 }}>Ingredients</h6>
                              <ul className="mb-2 ps-3" style={{ fontSize: '0.97em', maxHeight: isIngredientsExpanded ? 'none' : 60, overflow: isIngredientsExpanded ? 'visible' : 'hidden' }}>
                                {post.ingredients.map((ingredient, idx) => (
                                  <li key={idx}>{ingredient}</li>
                                ))}
                              </ul>
                              {post.ingredients.length > 4 && (
                                <Button variant="link" className="p-0 ms-1" style={{ fontSize: '0.9em' }} onClick={toggleIngredientsExpand}>
                                  {isIngredientsExpanded ? 'Show less' : 'Show more'}
                                </Button>
                              )}
                            </div>
                          )}
                          {/* Show instructions with show more/less */}
                          {post?.instructions && post.instructions.trim() !== '' && (
                            <div className="mb-2">
                              <h6 style={{ fontSize: '1em', marginBottom: 4 }}>Instructions</h6>
                              <p style={{ whiteSpace: 'pre-line', maxHeight: isInstructionsExpanded ? 'none' : 60, overflow: isInstructionsExpanded ? 'visible' : 'hidden', fontSize: '0.97em' }}>
                                {post.instructions}
                              </p>
                              {post.instructions.length > 120 && (
                                <Button variant="link" className="p-0 ms-1" style={{ fontSize: '0.9em' }} onClick={toggleInstructionsExpand}>
                                  {isInstructionsExpanded ? 'Show less' : 'Show more'}
                                </Button>
                              )}
                            </div>
                          )}
                        </>
                      )}
                      {bookmark.tags && bookmark.tags.length > 0 && (
                        <div className="mt-2">
                          {bookmark.tags.map((tag, index) => (
                            <Badge bg="secondary" className="me-1 mb-1" key={index}>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="text-muted mt-2 small">
                        Saved on {new Date(bookmark.createdAt).toLocaleDateString()}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
        
        {/* Bookmark Form Modal */}
        <Modal show={showModal} onHide={handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>{editingBookmark ? 'Edit Bookmark' : 'Add New Bookmark'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange}
                  placeholder="Bookmark title"
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Resource Type</Form.Label>
                <Form.Select 
                  name="resourceType" 
                  value={formData.resourceType} 
                  onChange={handleChange}
                >
                  <option value="external">External Resource</option>
                  <option value="post">Post on this platform</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>{formData.resourceType === 'external' ? 'URL' : 'Post ID'}</Form.Label>
                <Form.Control 
                  type="text" 
                  name="resourceId" 
                  value={formData.resourceId} 
                  onChange={handleChange}
                  placeholder={formData.resourceType === 'external' ? 'https://example.com/recipe' : 'Post ID'}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  name="note" 
                  value={formData.note} 
                  onChange={handleChange}
                  placeholder="Add your notes about this resource"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Tags</Form.Label>
                <Form.Control 
                  type="text" 
                  name="tags" 
                  value={formData.tags} 
                  onChange={handleChange}
                  placeholder="desserts, italian, quick (comma separated)"
                />
                <Form.Text className="text-muted">
                  Separate tags with commas
                </Form.Text>
              </Form.Group>
              
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={handleModalClose}>
                  <FaTimes className="me-1" /> Cancel
                </Button>
                <Button variant="primary" type="submit">
                  <FaSave className="me-1" /> {editingBookmark ? 'Update' : 'Save'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default Bookmarks;