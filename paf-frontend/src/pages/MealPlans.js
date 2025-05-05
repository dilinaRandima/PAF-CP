import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { mealPlanService, userService } from '../api/apiService';
import { FaPlus, FaTrash, FaEdit, FaUtensils } from 'react-icons/fa';

const MealPlans = () => {
  const { currentUser } = useContext(AuthContext);
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState({});
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const fetchMealPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all meal plans
      const response = await mealPlanService.getAllMealPlans();
      const fetchedMealPlans = response.data;
      
      setMealPlans(fetchedMealPlans);
      
      // Get unique user IDs to fetch user data
      const userIds = [...new Set(fetchedMealPlans.map(plan => plan.userId))];
      await fetchUsers(userIds);
      
    } catch (err) {
      console.error('Error fetching meal plans:', err);
      setError('Failed to load meal plans. Please try again later.');
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

  const handleDeleteMealPlan = async (mealPlanId) => {
    if (!window.confirm('Are you sure you want to delete this meal plan?')) {
      return;
    }
    
    try {
      setDeleting(mealPlanId);
      await mealPlanService.deleteMealPlan(mealPlanId);
      
      // Update state to remove deleted meal plan
      setMealPlans(prevPlans => prevPlans.filter(plan => plan.id !== mealPlanId));
    } catch (err) {
      console.error('Error deleting meal plan:', err);
      alert('Failed to delete meal plan. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading meal plans...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={fetchMealPlans}>Try Again</Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Meal Plans</h2>
        <Button 
          as={Link} 
          to="/create-meal-plan" 
          variant="primary"
        >
          <FaPlus className="me-2" /> Create New Plan
        </Button>
      </div>
      
      {mealPlans.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <FaUtensils size={50} className="text-muted mb-3" />
            <h4>No Meal Plans Yet</h4>
            <p className="text-muted">Create your first meal plan to share healthy eating habits with the community!</p>
            <Button 
              as={Link} 
              to="/create-meal-plan" 
              variant="primary" 
              className="mt-3"
            >
              Create Your First Meal Plan
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {mealPlans.map(plan => (
            <Col lg={4} md={6} className="mb-4" key={plan.id}>
              <Card className="custom-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <Badge bg="info" className="px-2 py-1">
                      {plan.goal}
                    </Badge>
                    {plan.userId === currentUser.id && (
                      <div className="dropdown">
                        <Button 
                          variant="link" 
                          className="text-decoration-none p-0 text-muted"
                          id={`dropdown-${plan.id}`}
                          data-bs-toggle="dropdown" 
                          aria-expanded="false"
                        >
                          ⋮
                        </Button>
                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby={`dropdown-${plan.id}`}>
                          <li>
                            <Link 
                              to={`/edit-meal-plan/${plan.id}`} 
                              className="dropdown-item"
                            >
                              <FaEdit className="me-2" /> Edit
                            </Link>
                          </li>
                          <li>
                            <button 
                              className="dropdown-item text-danger"
                              onClick={() => handleDeleteMealPlan(plan.id)}
                              disabled={deleting === plan.id}
                            >
                              {deleting === plan.id ? (
                                <>
                                  <Spinner 
                                    as="span" 
                                    animation="border" 
                                    size="sm" 
                                    role="status" 
                                    aria-hidden="true" 
                                    className="me-2"
                                  />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <FaTrash className="me-2" /> Delete
                                </>
                              )}
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <Card.Title>{plan.planName}</Card.Title>
                  
                  <Card.Text className="text-muted mb-2">
                    by {users[plan.userId]?.username || 'Unknown User'}
                  </Card.Text>
                  
                  <Card.Text className="description">
                    {plan.description || 'No description available'}
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="bg-white">
                  <Button 
                    as={Link} 
                    to={`/meal-plans/${plan.id}`} 
                    variant="outline-primary" 
                    className="w-100"
                  >
                    View Details
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default MealPlans;