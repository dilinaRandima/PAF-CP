import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import '../styles/NotFound.css';

const NotFound = () => {
  return (
    <Container className="py-5 text-center">
      <Row className="justify-content-center">
        <Col md={6}>
          <FaExclamationTriangle size={80} className="text-warning mb-4" />
          <h1 className="display-4 mb-4">Page Not Found</h1>
          <p className="lead mb-4">
            The page you are looking for does not exist or has been moved.
          </p>
          <Button as={Link} to="/" variant="primary" size="lg">
            <FaArrowLeft className="me-2" /> Go Back Home
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;