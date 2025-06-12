import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { notificationService, userService } from '../api/apiService';
import { FaBell, FaCheck, FaTrash, FaHeart, FaComment, FaUsers } from 'react-icons/fa';
import '../styles/Notifications.css'; // Import the new CSS file

const Notifications = () => {
  const { currentUser } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await notificationService.getUserNotifications(currentUser.id);
      setNotifications(response.data);
      
      // Get unique user IDs from notifications
      const userIds = [...new Set(response.data.map(notif => notif.actionUserId).filter(Boolean))];
      await fetchUsers(userIds);
      
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again later.');
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

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true } 
          : notif
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(currentUser.id);
      
      // Update local state
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <FaHeart className="text-danger" />;
      case 'comment':
        return <FaComment className="text-primary" />;
      case 'group_invite':
      case 'group_join':
        return <FaUsers className="text-success" />;
      default:
        return <FaBell className="text-secondary" />;
    }
  };

  const getNotificationLink = (notification) => {
    const { sourceType, sourceId } = notification;
    
    switch (sourceType) {
      case 'post':
        return `/posts/${sourceId}`;
      case 'group':
        return `/groups/${sourceId}`;
      default:
        return '#';
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading notifications...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger">{error}</div>
        <Button onClick={fetchNotifications}>Try Again</Button>
      </Container>
    );
  }

  return (
    <div className="notifications-background">
      <Container className="py-4 main-content-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Notifications</h2>
          {notifications.some(notif => !notif.read) && (
            <Button 
              variant="outline-primary" 
              onClick={handleMarkAllAsRead}
            >
              <FaCheck className="me-2" /> Mark All as Read
            </Button>
          )}
        </div>
        {notifications.length === 0 ? (
          <Card className="text-center p-5">
            <Card.Body>
              <FaBell size={50} className="text-muted mb-3" />
              <h4>No Notifications</h4>
              <p className="text-muted">You don't have any notifications yet.</p>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            <Col lg={8} className="mx-auto">
              {notifications.map(notification => (
                <Card 
                  key={notification.id} 
                  className={`mb-3 ${!notification.read ? 'border-primary' : ''}`}
                >
                  <Card.Body>
                    <div className="d-flex align-items-start">
                      <div className="me-3 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between">
                          <div>
                            <Link 
                              to={getNotificationLink(notification)} 
                              className="text-decoration-none"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <p className="mb-1">
                                {notification.message}
                              </p>
                            </Link>
                            <small className="text-muted">
                              {new Date(notification.timestamp).toLocaleString()}
                            </small>
                          </div>
                          <div className="d-flex">
                            {!notification.read && (
                              <Button 
                                variant="link" 
                                className="text-primary p-0 me-3"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <FaCheck />
                              </Button>
                            )}
                            <Button 
                              variant="link" 
                              className="text-danger p-0"
                              onClick={() => handleDeleteNotification(notification.id)}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default Notifications;