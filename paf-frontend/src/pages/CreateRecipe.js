import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { postService } from '../api/apiService';
import { FaSave, FaTimes } from 'react-icons/fa';
import MediaUpload from '../components/MediaUpload';
import { toast } from 'react-toastify';
import IngredientInput from '../components/IngredientInput';
import InstructionInput from '../components/InstructionInput';
import '../styles/CreateRecipe.css';

const CreateRecipe = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [newPost, setNewPost] = useState({
    title: '',
    contentDescription: '',
    ingredients: [],
    instructions: '',
    cookingTime: '',
    difficultyLevel: '',
    cuisineType: ''
  });
  
  const [mediaItems, setMediaItems] = useState([]);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [selectedInstructionIdx, setSelectedInstructionIdx] = useState(null);

  const handleNewPostChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'ingredients') {
      setNewPost(prev => ({
        ...prev,
        [name]: value.split('\n').filter(line => line.trim())
      }));
    } else {
      setNewPost(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNewPostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.contentDescription) {
      toast.error('Title and description are required');
      return;
    }
    try {
      setSubmittingPost(true);
      // Create arrays from media items
      const mediaLinks = mediaItems.map(item => item.url);
      const mediaTypes = mediaItems.map(item => item.type);
      // Make sure ingredients is an array
      const ingredients = Array.isArray(newPost.ingredients) ? newPost.ingredients :
        (typeof newPost.ingredients === 'string' ? newPost.ingredients.split('\n').filter(i => i.trim()) : []);
      // Convert instructions array to string if needed
      const instructions = Array.isArray(newPost.instructions)
        ? newPost.instructions.join('\n')
        : newPost.instructions;
      const postData = {
        ...newPost,
        ingredients: ingredients,
        instructions: instructions,
        userId: currentUser.id,
        timestamp: new Date().toISOString(), // Ensure proper date format
        // Add both formats to ensure compatibility
        mediaLinks: mediaLinks,
        mediaTypes: mediaTypes,
        // Legacy format - only use first item if available
        mediaLink: mediaLinks.length > 0 ? mediaLinks[0] : '',
        mediaType: mediaTypes.length > 0 ? mediaTypes[0] : ''
      };
      console.log("Posting data:", postData);
      const response = await postService.createPost(postData);
      console.log("Post created:", response);
      toast.success('Recipe shared successfully!');
      navigate('/feed');
    } catch (err) {
      console.error('Error creating post:', err);
      console.error('Error details:', err.response?.data || err.message);
      toast.error('Failed to create post. Please try again.');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleCancel = () => {
    navigate('/feed');
  };

  return (
    <div className="createrecipe-background">
      <Container className="py-4 main-content-container">
        <Row>
          <Col lg={8} className="mx-auto">
            <Card className="custom-card mb-4">
              <Card.Body>
                <h2 className="mb-4">Share a Cooking Skill or Recipe</h2>
                <Form onSubmit={handleNewPostSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Recipe Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={newPost.title || ''}
                      onChange={handleNewPostChange}
                      placeholder="Name of your dish or cooking technique"
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Share the story behind this recipe or skill"
                      name="contentDescription"
                      value={newPost.contentDescription}
                      onChange={handleNewPostChange}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Ingredients</Form.Label>
                    <IngredientInput
                      ingredients={Array.isArray(newPost.ingredients) ? newPost.ingredients : []}
                      onChange={ingredients => setNewPost(prev => ({ ...prev, ingredients }))}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Instructions</Form.Label>
                    <InstructionInput
                      instructions={Array.isArray(newPost.instructions) ? newPost.instructions : (newPost.instructions ? newPost.instructions.split('\n') : [])}
                      onChange={instructions => setNewPost(prev => ({ ...prev, instructions }))}
                      showRadio={true}
                      selectedIdx={selectedInstructionIdx}
                      onRadioChange={setSelectedInstructionIdx}
                    />
                  </Form.Group>
                  
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Cooking Time</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g. 30 mins"
                          name="cookingTime"
                          value={newPost.cookingTime || ''}
                          onChange={handleNewPostChange}
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Difficulty Level</Form.Label>
                        <Form.Select
                          name="difficultyLevel"
                          value={newPost.difficultyLevel || ''}
                          onChange={handleNewPostChange}
                        >
                          <option value="">Select difficulty</option>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Cuisine Type</Form.Label>
                        <Form.Select
                          name="cuisineType"
                          value={newPost.cuisineType || ''}
                          onChange={handleNewPostChange}
                        >
                          <option value="">Select cuisine</option>
                          <option value="Italian">Italian</option>
                          <option value="Chinese">Chinese</option>
                          <option value="Mexican">Mexican</option>
                          <option value="Indian">Indian</option>
                          <option value="Japanese">Japanese</option>
                          <option value="French">French</option>
                          <option value="Thai">Thai</option>
                          <option value="American">American</option>
                          <option value="Other">Other</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Add Photos/Videos</Form.Label>
                    <MediaUpload 
                      onChange={items => {
                        setMediaItems(items);
                        console.log("Media items updated:", items);
                      }} 
                      maxItems={3} 
                    />
                  </Form.Group>
                  
                  <div className="d-flex justify-content-between">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCancel}
                    >
                      <FaTimes className="me-2" /> Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={submittingPost || !newPost.title || !newPost.contentDescription}
                    >
                      {submittingPost ? (
                        <>
                          <Spinner 
                            as="span" 
                            animation="border" 
                            size="sm" 
                            role="status" 
                            aria-hidden="true" 
                            className="me-2"
                          />
                          Posting...
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
    </div>
  );
};

export default CreateRecipe;