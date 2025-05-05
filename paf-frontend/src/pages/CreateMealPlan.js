import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { mealPlanService } from '../api/apiService';
import { FaSave, FaTimes } from 'react-icons/fa';

const CreateMealPlan = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: currentUser.id,
    planName: '',
    description: '',
    goal: '',
    routines: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.planName || !formData.goal) {
      setError('Please provide a plan name and goal at minimum');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await mealPlanService.createMealPlan(formData);
      
      // Redirect to meal plans page on success
      navigate('/meal-plans');
    } catch (err) {
      console.error('Error creating meal plan:', err);
      setError('Failed to create meal plan. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goalOptions = [
    'Weight Loss',
    'Muscle Gain',
    'Maintenance',
    'Performance',
    'Health Improvement',
    'Other'
  ];

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="custom-card">
            <Card.Body>
              <h2 className="mb-4">Create a Meal Plan</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Plan Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="planName" 
                    value={formData.planName} 
                    onChange={handleChange}
                    placeholder="Give your meal plan a name"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Goal</Form.Label>
                  <Form.Select 
                    name="goal" 
                    value={formData.goal} 
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a goal for this meal plan</option>
                    {goalOptions.map(goal => (
                      <option key={goal} value={goal}>{goal}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange}
                    placeholder="Describe your meal plan (e.g., target audience, benefits, etc.)"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Meal Plan Routines</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={10} 
                    name="routines" 
                    value={formData.routines} 
                    onChange={handleChange}
                    placeholder={`Enter your complete meal plan details here.\n\nFor example:\n\nBreakfast:\n- 2 eggs, scrambled\n- 1 slice whole grain toast\n- 1/2 avocado\n\nLunch:\n- Grilled chicken salad with olive oil dressing\n- 1 apple\n\nDinner:\n- Baked salmon (4 oz)\n- Steamed broccoli\n- Brown rice (1/2 cup)\n\nSnacks:\n- Greek yogurt with berries\n- Handful of almonds`}
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-between">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/meal-plans')}
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
                        Creating...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" /> Create Meal Plan
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

export default CreateMealPlan;