import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { FaBell, FaUser, FaBookmark, FaUsers, FaHome, FaStream, FaListAlt, FaUtensils } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { notificationService } from '../api/apiService';

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
      const interval = setInterval(fetchNotificationCount, 60000);
      
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  return (
    <header className="header">
      <Container>
        <Navbar expand="lg" className="navbar">
          <Navbar.Brand as={Link} to="/" className="navbar-brand">
            <FaUtensils className="brand-icon" />
            Cookbook
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="navbar-nav" />
          
          <Navbar.Collapse id="navbar-nav">
            <Nav className="mx-auto">
              <Nav.Link 
                as={Link} 
                to="/" 
                className={`nav-link ${isActive('/')}`}
              >
                <FaHome className="nav-icon-inline" size={16} /> Home
              </Nav.Link>
              {/* Show Recipes only if logged in */}
              {currentUser && (
                <Nav.Link 
                  as={Link} 
                  to="/feed" 
                  className={`nav-link ${isActive('/feed')}`}
                >
                  <FaStream className="nav-icon-inline" size={16} /> Feeds
                </Nav.Link>
              )}
              {currentUser && (
                <>
                  <Nav.Link 
                    as={Link} 
                    to="/my-recipes" 
                    className={`nav-link ${isActive('/my-recipes')}`}
                  >
                    <FaListAlt className="nav-icon-inline" size={16} /> My Feeds
                  </Nav.Link>
                  
                  <Nav.Link 
                    as={Link} 
                    to="/bookmarks" 
                    className={`nav-link ${isActive('/bookmarks')}`}
                  >
                    <FaBookmark className="nav-icon-inline" size={16} />
                    Bookmarks
                  </Nav.Link>
                  
                  <Nav.Link 
                    as={Link} 
                    to="/groups" 
                    className={`nav-link ${isActive('/groups')}`}
                  >
                    <FaUsers className="nav-icon-inline" size={16} />
                    Communities
                  </Nav.Link>
                </>
              )}
            </Nav>
            
            <Nav className="ms-auto align-items-center nav-icons">
              {currentUser ? (
                <>
                  <Link to="/notifications" className="nav-icon position-relative me-3">
                    <FaBell />
                    {unreadNotifications > 0 && (
                      <span className="notification-badge">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </span>
                    )}
                  </Link>
                  
                  <Dropdown align="end">
                    <Dropdown.Toggle as="div" className="nav-icon" id="user-dropdown">
                      <FaUser />
                    </Dropdown.Toggle>
                    
                    <Dropdown.Menu className="dropdown-menu-dark">
                      <Dropdown.Item as={Link} to={`/profile/${currentUser.id}`}>
                        My Profile
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/edit-profile">
                        Edit Profile
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={handleLogout}>
                        Logout
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-link">
                    Login
                  </Link>
                  <Link to="/register" className="nav-link">
                    Sign Up
                  </Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </Container>
    </header>
  );
};

export default Header;