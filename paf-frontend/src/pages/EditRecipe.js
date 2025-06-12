import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { postService } from '../api/apiService';
import { FaSave, FaTimes } from 'react-icons/fa';
import MediaUpload from '../components/MediaUpload';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/EditRecipe.css';
import IngredientInput from '../components/IngredientInput';
import InstructionInput from '../components/InstructionInput';

const EditRecipe = () => {
  const { postId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [postData, setPostData] = useState({
    title: '',
    contentDescription: '',
    ingredients: [],
    instructions: '',
    cookingTime: '',
    difficultyLevel: '',
    cuisineType: ''
  });
  
  const [mediaItems, setMediaItems] = useState([]);
  const [selectedInstructionIdx, setSelectedInstructionIdx] = useState(null);
  
  useEffect(() => {
    fetchPost();
  }, [postId]);
  
  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the entire post list and find the one with matching ID
      // This is a workaround if you don't have a direct API to get a post by ID
      const response = await postService.getAllPosts();
      const post = response.data.find(p => p.id === postId);
      
      if (!post) {
        setError('Recipe not found');
        return;
      }
      
      // Verify this is the owner
      if (post.userId !== currentUser.id) {
        setError('You do not have permission to edit this recipe');
        return;
      }
      
      // Set post data
      setPostData({
        title: post.title || '',
        contentDescription: post.contentDescription || '',
        ingredients: post.ingredients || [],
        instructions: post.instructions || '',
        cookingTime: post.cookingTime || '',
        difficultyLevel: post.difficultyLevel || '',
        cuisineType: post.cuisineType || ''
      });
      
      // Set media items
      const media = [];
      if (post.mediaLinks && post.mediaLinks.length > 0) {
        post.mediaLinks.forEach((url, index) => {
          media.push({
            id: Date.now() + index,
            url,
            type: post.mediaTypes && post.mediaTypes.length > index 
              ? post.mediaTypes[index] 
              : 'image/jpeg',
            blobCreatedByUs: false
          });
        });
      } else if (post.mediaLink) {
        // Legacy format
        media.push({
          id: Date.now(),
          url: post.mediaLink,
          type: post.mediaType || 'image/jpeg',
          blobCreatedByUs: false
        });
      }
      
      setMediaItems(media);
      
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load recipe data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'ingredients') {
      // Handle ingredients as an array
      setPostData(prev => ({
        ...prev,
        ingredients: value.split('\n').filter(line => line.trim())
      }));
    } else {
      setPostData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postData.title || !postData.contentDescription) {
      toast.error('Title and description are required');
      return;
    }
    try {
      setSubmitting(true);
      // Prepare media data
      const mediaLinks = mediaItems.map(item => item.url);
      const mediaTypes = mediaItems.map(item => item.type);
      // Convert instructions array to string if needed
      const updatedPost = {
        ...postData,
        instructions: Array.isArray(postData.instructions)
          ? postData.instructions.join('\n')
          : postData.instructions,
        mediaLinks,
        mediaTypes,
        // Legacy format for backward compatibility
        mediaLink: mediaLinks.length > 0 ? mediaLinks[0] : '',
        mediaType: mediaTypes.length > 0 ? mediaTypes[0] : ''
      };
      await postService.updatePost(postId, updatedPost, currentUser.id);
      toast.success('Recipe updated successfully!');
      setTimeout(() => {
        navigate('/my-recipes');
      }, 1500);
    } catch (err) {
      console.error('Error updating recipe:', err);
      if (err.response?.status === 403) {
        toast.error('You do not have permission to edit this recipe');
      } else {
        toast.error('Failed to update recipe. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/my-recipes');
  };
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading recipe data...</p>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate('/my-recipes')}>
          Back to My Recipes
        </Button>
      </Container>
    );
  }
  
  return (
    <div className="editrecipe-background">
      <Container className="py-4 main-content-container">
        <Row>
          <Col lg={8} className="mx-auto">
            <Card className="shadow-sm">
              <Card.Body>
                <h2 className="mb-4">Edit Recipe</h2>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Recipe Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={postData.title}
                      onChange={handleChange}
                      placeholder="Name of your dish or cooking technique"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="contentDescription"
                      value={postData.contentDescription}
                      onChange={handleChange}
                      placeholder="Share the story behind this recipe or skill"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Ingredients</Form.Label>
                    <IngredientInput
                      ingredients={Array.isArray(postData.ingredients) ? postData.ingredients : []}
                      onChange={ingredients => setPostData(prev => ({ ...prev, ingredients }))}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Instructions</Form.Label>
                    <InstructionInput
                      instructions={Array.isArray(postData.instructions) ? postData.instructions : (postData.instructions ? postData.instructions.split('\n') : [])}
                      onChange={instructions => setPostData(prev => ({ ...prev, instructions }))}
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
                          name="cookingTime"
                          value={postData.cookingTime}
                          onChange={handleChange}
                          placeholder="e.g. 30 mins"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Difficulty Level</Form.Label>
                        <Form.Select
                          name="difficultyLevel"
                          value={postData.difficultyLevel}
                          onChange={handleChange}
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
                          value={postData.cuisineType}
                          onChange={handleChange}
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
                    <Form.Label>Photos/Videos</Form.Label>
                    <MediaUpload 
                      onChange={setMediaItems} 
                      maxItems={3}
                      initialItems={mediaItems}
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
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Spinner 
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaSave className="me-2" /> Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </Container>
    </div>
  );
};

export default EditRecipe;