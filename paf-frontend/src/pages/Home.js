import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FaArrowRight, FaBook, FaUsers, FaClock } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <div className="hero-content">
                <h1 className="hero-title">
                  It is even better than an expensive cookery book
                </h1>
                <p className="hero-subtitle">
                  Learn how to make your favorite restaurant's dishes
                </p>
                
                <div className="hero-buttons">
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Get Started <FaArrowRight className="ms-2" />
                  </Link>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="hero-image">
                {/* The hero image is handled by the background in CSS */}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="section-title">Why Choose Cookbook?</h2>
              <p className="section-subtitle text-secondary">
                Discover amazing recipes and connect with food lovers worldwide
              </p>
            </Col>
          </Row>
          
          <Row>
            <Col md={4} className="mb-4">
              <div className="feature-card text-center p-4">
                <div className="feature-icon mb-3">
                  <FaBook size={48} />
                </div>
                <h3>Thousands of Recipes</h3>
                <p className="text-secondary">
                  Access our vast collection of recipes from around the world
                </p>
              </div>
            </Col>
            
            <Col md={4} className="mb-4">
              <div className="feature-card text-center p-4">
                <div className="feature-icon mb-3">
                  <FaUsers size={48} />
                </div>
                <h3>Community Driven</h3>
                <p className="text-secondary">
                  Join our community of passionate cooks and food enthusiasts
                </p>
              </div>
            </Col>
            
            <Col md={4} className="mb-4">
              <div className="feature-card text-center p-4">
                <div className="feature-icon mb-3">
                  <FaClock size={48} />
                </div>
                <h3>Quick & Easy</h3>
                <p className="text-secondary">
                  Find recipes that fit your schedule and skill level
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <h2 className="mb-3">Ready to start cooking?</h2>
              <p className="text-secondary mb-4">
                Join thousands of home cooks who are already creating amazing dishes
              </p>
            </Col>
            <Col lg={4} className="text-lg-end">
              <Link to="/feed" className="btn btn-secondary btn-lg">
                Browse Recipes
              </Link>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5 bg-dark">
        <Container>
          <Row className="text-center">
            <Col md={3} className="mb-3">
              <h3 className="stat-number text-primary">50K+</h3>
              <p className="stat-label text-secondary">Recipes</p>
            </Col>
            <Col md={3} className="mb-3">
              <h3 className="stat-number text-primary">100K+</h3>
              <p className="stat-label text-secondary">Active Users</p>
            </Col>
            <Col md={3} className="mb-3">
              <h3 className="stat-number text-primary">200+</h3>
              <p className="stat-label text-secondary">Countries</p>
            </Col>
            <Col md={3} className="mb-3">
              <h3 className="stat-number text-primary">4.8</h3>
              <p className="stat-label text-secondary">Rating</p>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;