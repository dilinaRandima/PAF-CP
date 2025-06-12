import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { groupService } from '../api/apiService';
import { FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import '../styles/CreateGroup.css';



const CreateGroup = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    isPublic: true,
    tags: ['cooking'],
    rules: ['Be respectful to all members'],
    creatorId: currentUser.id,
    memberIds: [currentUser.id],
    adminIds: [currentUser.id]
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when form is changed
    if (error) {
      setError(null);
    }
  };

  const handleTagChange = (index, value) => {
    const updatedTags = [...formData.tags];
    updatedTags[index] = value;
    
    setFormData({
      ...formData,
      tags: updatedTags
    });
  };

  const handleRuleChange = (index, value) => {
    const updatedRules = [...formData.rules];
    updatedRules[index] = value;
    
    setFormData({
      ...formData,
      rules: updatedRules
    });
  };

  const addTag = () => {
    setFormData({
      ...formData,
      tags: [...formData.tags, '']
    });
  };

  const removeTag = (index) => {
    const updatedTags = [...formData.tags];
    updatedTags.splice(index, 1);
    
    setFormData({
      ...formData,
      tags: updatedTags
    });
  };

  const addRule = () => {
    setFormData({
      ...formData,
      rules: [...formData.rules, '']
    });
  };

  const removeRule = (index) => {
    const updatedRules = [...formData.rules];
    updatedRules.splice(index, 1);
    
    setFormData({
      ...formData,
      rules: updatedRules
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name) {
      setError('Please provide a group name');
      return;
    }
    
    // Filter out empty tags and rules
    const filteredTags = formData.tags.filter(tag => tag.trim() !== '');
    const filteredRules = formData.rules.filter(rule => rule.trim() !== '');
    
    const submitData = {
      ...formData,
      tags: filteredTags,
      rules: filteredRules
    };
    
    try {
      setIsSubmitting(true);
      
      const response = await groupService.createGroup(submitData);
      
      // Navigate to the new group page
      navigate(`/groups/${response.data.id}`);
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Failed to create group. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="custom-card">
            <Card.Body>
              <h2 className="mb-4">Create a Cooking Community</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Group Name *</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange}
                    placeholder="Give your cooking community a name"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange}
                    placeholder="Describe what your group is about"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Image URL</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="imageUrl" 
                    value={formData.imageUrl} 
                    onChange={handleChange}
                    placeholder="Provide a URL for your group banner image (optional)"
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Check 
                    type="checkbox" 
                    name="isPublic" 
                    checked={formData.isPublic} 
                    onChange={handleChange}
                    label="Make this group public (visible to everyone)" 
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Tags</Form.Label>
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="d-flex mb-2">
                      <Form.Control 
                        type="text" 
                        value={tag} 
                        onChange={(e) => handleTagChange(index, e.target.value)}
                        placeholder="Enter a tag (e.g., baking, italian, vegan)"
                      />
                      {formData.tags.length > 1 && (
                        <Button 
                          variant="outline-danger" 
                          className="ms-2" 
                          onClick={() => removeTag(index)}
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={addTag} 
                    className="mt-2"
                  >
                    <FaPlus className="me-1" /> Add Tag
                  </Button>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Group Rules</Form.Label>
                  {formData.rules.map((rule, index) => (
                    <div key={index} className="d-flex mb-2">
                      <Form.Control 
                        type="text" 
                        value={rule} 
                        onChange={(e) => handleRuleChange(index, e.target.value)}
                        placeholder="Enter a rule for your group"
                      />
                      {formData.rules.length > 1 && (
                        <Button 
                          variant="outline-danger" 
                          className="ms-2" 
                          onClick={() => removeRule(index)}
                        >
                          <FaTrash />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={addRule} 
                    className="mt-2"
                  >
                    <FaPlus className="me-1" /> Add Rule
                  </Button>
                </Form.Group>
                
                <div className="d-flex justify-content-between">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/groups')}
                  >
                    <FaTimes className="me-2" /> Cancel
                  </Button>
                  
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={isSubmitting || !formData.name}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner 
                          as="span" 
                          animation="border" 
                          size="sm" 
                          role="status" 
                          aria-hidden="true" 
                          className="me-2"
                        />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" /> Create Group
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
  );
};

export default CreateGroup;