import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { FaUser, FaBell, FaCog, FaSignOutAlt, FaBookmark, FaUsers } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { notificationService } from '../api/apiService';

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const [unreadNotifications, setUnreadNotifications] = useState(0);

// Add useEffect to fetch notification count
useEffect(() => {
  if (currentUser) {
    const fetchNotificationCount = async () => {
      try {
        const response = await notificationService.getUnreadNotifications(currentUser.id);
        setUnreadNotifications(response.data.length);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    
    fetchNotificationCount();
    
    // Set up interval to check for new notifications
    const interval = setInterval(fetchNotificationCount, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }
}, [currentUser]);


  return (
    <Navbar bg="light" expand="lg" className="header">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <strong>CookBook</strong>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          {currentUser ? (
            <>
              <Nav className="me-auto">
                <Nav.Link 
                  as={Link} 
                  to="/feed" 
                  className={`nav-link ${isActive('/feed')}`}
                >
                  Feed
                </Nav.Link>
                
                <Nav.Link 
  as={Link} 
  to="/bookmarks" 
  className={`nav-link ${isActive('/bookmarks')}`}
>
  <FaBookmark className="me-1" /> Bookmarks
</Nav.Link>
<Nav.Link 
  as={Link} 
  to="/groups" 
  className={`nav-link ${isActive('/groups')}`}
>
  <FaUsers className="me-1" /> Communities
</Nav.Link>
              </Nav>

              
              <Nav>
              <Nav.Link as={Link} to="/notifications">
  <div className="position-relative">
    <FaBell size={18} />
    {unreadNotifications > 0 && (
      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
        {unreadNotifications > 9 ? '9+' : unreadNotifications}
      </span>
    )}
  </div>
</Nav.Link>
                
                <Dropdown align="end">
                  <Dropdown.Toggle as="a" className="nav-link" id="user-dropdown">
                    <FaUser size={18} />
                  </Dropdown.Toggle>
                  
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to={`/profile/${currentUser.id}`}>
                      <FaUser className="me-2" /> My Profile
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/edit-profile">
                      <FaCog className="me-2" /> Edit Profile
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>
                      <FaSignOutAlt className="me-2" /> Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Nav>
            </>
          ) : (
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/login" className={`nav-link ${isActive('/login')}`}>
                Login
              </Nav.Link>
              <Button 
                as={Link} 
                to="/register" 
                variant="primary"
                className="ms-2"
              >
                Register
              </Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;