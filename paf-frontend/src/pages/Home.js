import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { FaUtensils, FaUsers, FaRunning } from 'react-icons/fa';

const Home = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to feed if user is already logged in
    if (currentUser) {
      navigate('/feed');
    }
  }, [currentUser, navigate]);

  const featureCards = [
    {
      title: 'Meal Plans',
      description: 'Create and share meal plans with friends. Get inspired by others\' healthy eating habits.',
      icon: <FaUtensils size={40} className="text-primary mb-3" />,
      link: '/meal-plans'
    },
    {
      title: 'Skill Shares',
      description: 'Learn and teach cooking skills with the community. Share your expertise with others.',
      icon: <FaUsers size={40} className="text-primary mb-3" />,
      link: '/skill-shares'
    },
    {
      title: 'Recepie Updates',
      description: 'Post your cooking progress and achievements. Stay motivated with community support.',
      icon: <FaRunning size={40} className="text-primary mb-3" />,
      link: '/feed'
    }
  ];

  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col>
          <div className="text-center">
            <h1 className="display-4 fw-bold">Welcome to CookBook</h1>
            <p className="lead">Connect with your friends, share your recipies, and achieve your goals together.</p>
          </div>
        </Col>
      </Row>

      <Row>
        {featureCards.map((feature, index) => (
          <Col md={4} key={index} className="mb-4">
            <Card className="h-100 custom-card text-center">
              <Card.Body className="d-flex flex-column">
                <div>{feature.icon}</div>
                <Card.Title>{feature.title}</Card.Title>
                <Card.Text>{feature.description}</Card.Text>
                <div className="mt-auto pt-3">
                  <Button 
                    variant="outline-primary" 
                    onClick={() => navigate(feature.link)}
                  >
                    Explore
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="mt-5">
        <Col className="text-center">
          <h2>Ready to start your cooking journey?</h2>
          <p>Join our community today and connect with like-minded chefs.</p>
          <Button 
            variant="primary" 
            size="lg" 
            className="mt-3"
            onClick={() => navigate('/register')}
          >
            Join Now
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;