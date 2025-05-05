import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer py-3 mt-5">
      <Container>
        <Row>
          <Col md={6} className="text-center text-md-start">
            <p className="mb-0">© {currentYear} CookBook. All rights reserved.</p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <p className="mb-0">A Cooking Application for everyone</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;