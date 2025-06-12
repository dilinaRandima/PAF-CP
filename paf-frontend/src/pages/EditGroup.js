import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { groupService } from '../api/apiService';
import { FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import '../styles/EditGroup.css';

const EditGroup = () => {
  const { groupId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    isPublic: true,
    tags: [],
    rules: [],
    creatorId: '',
    memberIds: [],
    adminIds: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await groupService.getGroupById(groupId);
        setFormData(response.data);
      } catch (err) {
        setError('Failed to load group data.');
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [groupId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (error) setError(null);
  };

  const handleTagChange = (index, value) => {
    const updatedTags = [...formData.tags];
    updatedTags[index] = value;
    setFormData({ ...formData, tags: updatedTags });
  };

  const handleRuleChange = (index, value) => {
    const updatedRules = [...formData.rules];
    updatedRules[index] = value;
    setFormData({ ...formData, rules: updatedRules });
  };

  const addTag = () => {
    setFormData({ ...formData, tags: [...formData.tags, ''] });
  };

  const removeTag = (index) => {
    const updatedTags = [...formData.tags];
    updatedTags.splice(index, 1);
    setFormData({ ...formData, tags: updatedTags });
  };

  const addRule = () => {
    setFormData({ ...formData, rules: [...formData.rules, ''] });
  };

  const removeRule = (index) => {
    const updatedRules = [...formData.rules];
    updatedRules.splice(index, 1);
    setFormData({ ...formData, rules: updatedRules });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setError('Please provide a group name');
      return;
    }
    const filteredTags = formData.tags.filter(tag => tag.trim() !== '');
    const filteredRules = formData.rules.filter(rule => rule.trim() !== '');
    const submitData = {
      ...formData,
      tags: filteredTags,
      rules: filteredRules
    };
    try {
      setIsSubmitting(true);
      await groupService.updateGroup(groupId, submitData);
      navigate(`/groups/${groupId}`);
    } catch (err) {
      setError('Failed to update group. Please try again.');
    } finally {
      setIsSubmitting(false);
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

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="custom-card">
            <Card.Body>
              <h2 className="mb-4">Edit Cooking Community</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Group Name *</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange}
                    placeholder="Group name"
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
                    placeholder="Describe your group"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Image URL</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="imageUrl" 
                    value={formData.imageUrl} 
                    onChange={handleChange}
                    placeholder="Group banner image URL (optional)"
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
                    onClick={() => navigate(`/groups/${groupId}`)}
                  >
                    <FaTimes className="me-1" /> Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <><Spinner size="sm" animation="border" className="me-2" />Saving...</>
                    ) : (
                      <><FaSave className="me-1" /> Save Changes</>
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

export default EditGroup; 