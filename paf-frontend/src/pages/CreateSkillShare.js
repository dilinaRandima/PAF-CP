import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { skillShareService } from '../api/apiService';
import { FaSave, FaTimes, FaImage, FaPlus, FaTrash } from 'react-icons/fa';

const CreateSkillShare = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: currentUser.id,
    mealDetails: '',
    dietaryPreferences: '',
    ingredients: '',
    mediaUrls: [''],
    mediaTypes: ['image/jpeg']
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when form is changed
    if (error) {
      setError(null);
    }
  };

  const handleMediaUrlChange = (index, value) => {
    const updatedMediaUrls = [...formData.mediaUrls];
    updatedMediaUrls[index] = value;
    
    setFormData({
      ...formData,
      mediaUrls: updatedMediaUrls
    });
  };

  const handleMediaTypeChange = (index, value) => {
    const updatedMediaTypes = [...formData.mediaTypes];
    updatedMediaTypes[index] = value;
    
    setFormData({
      ...formData,
      mediaTypes: updatedMediaTypes
    });
  };

  const addMediaField = () => {
    setFormData({
      ...formData,
      mediaUrls: [...formData.mediaUrls, ''],
      mediaTypes: [...formData.mediaTypes, 'image/jpeg']
    });
  };

  const removeMediaField = (index) => {
    const updatedMediaUrls = [...formData.mediaUrls];
    const updatedMediaTypes = [...formData.mediaTypes];
    
    updatedMediaUrls.splice(index, 1);
    updatedMediaTypes.splice(index, 1);
    
    setFormData({
      ...formData,
      mediaUrls: updatedMediaUrls,
      mediaTypes: updatedMediaTypes
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.mealDetails) {
      setError('Please provide a title for your skill share');
      return;
    }
    
    // Filter out empty media URLs
    const filteredMediaUrls = formData.mediaUrls.filter(url => url.trim() !== '');
    const filteredMediaTypes = formData.mediaUrls.map((url, index) => {
      return url.trim() !== '' ? formData.mediaTypes[index] : null;
    }).filter(type => type !== null);
    
    const submitData = {
      ...formData,
      mediaUrls: filteredMediaUrls,
      mediaTypes: filteredMediaTypes
    };
    
    try {
      setIsSubmitting(true);
      
      await skillShareService.createSkillShare(submitData);
      
      // Redirect to skill shares page on success
      navigate('/skill-shares');
    } catch (err) {
      console.error('Error creating skill share:', err);
      setError('Failed to create skill share. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dietaryPreferenceOptions = [
    'Vegan',
    'Vegetarian',
    'Gluten-Free',
    'Dairy-Free',
    'Keto',
    'Paleo',
    'Low-Carb',
    'High-Protein',
    'Pescatarian',
    'No Restrictions'
  ];

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="custom-card">
            <Card.Body>
              <h2 className="mb-4">Share Your Cooking Skills</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Recipe Title</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="mealDetails" 
                    value={formData.mealDetails} 
                    onChange={handleChange}
                    placeholder="E.g., 'High-Protein Overnight Oats' or 'Quick Post-Workout Smoothie'"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Dietary Preference</Form.Label>
                  <Form.Select 
                    name="dietaryPreferences" 
                    value={formData.dietaryPreferences} 
                    onChange={handleChange}
                  >
                    <option value="">Select dietary preference (optional)</option>
                    {dietaryPreferenceOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Ingredients</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={5} 
                    name="ingredients" 
                    value={formData.ingredients} 
                    onChange={handleChange}
                    placeholder="List all ingredients needed for your recipe"
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="mb-0">Media</Form.Label>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={addMediaField}
                    >
                      <FaPlus className="me-1" /> Add Media
                    </Button>
                  </div>
                  
                  {formData.mediaUrls.map((url, index) => (
                    <Row key={index} className="mb-2 align-items-center">
                      <Col xs={8}>
                        <Form.Control 
                          type="text" 
                          value={url} 
                          onChange={(e) => handleMediaUrlChange(index, e.target.value)}
                          placeholder="Enter media URL"
                        />
                      </Col>
                      <Col xs={3}>
                        <Form.Select 
                          value={formData.mediaTypes[index]} 
                          onChange={(e) => handleMediaTypeChange(index, e.target.value)}
                        >
                          <option value="image/jpeg">Image</option>
                          <option value="video/mp4">Video</option>
                        </Form.Select>
                      </Col>
                      <Col xs={1} className="ps-0">
                        {formData.mediaUrls.length > 1 && (
                          <Button 
                            variant="link" 
                            className="text-danger p-0" 
                            onClick={() => removeMediaField(index)}
                          >
                            <FaTrash />
                          </Button>
                        )}
                      </Col>
                    </Row>
                  ))}
                  <Form.Text className="text-muted">
                    Provide URLs to photos or videos of your recipe
                  </Form.Text>
                </Form.Group>
                
                <div className="d-flex justify-content-between">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/skill-shares')}
                  >
                    <FaTimes className="me-2" /> Cancel
                  </Button>
                  
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={isSubmitting}
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
                        Sharing...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" /> Share Recipe
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

export default CreateSkillShare;