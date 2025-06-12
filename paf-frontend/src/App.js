import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './styles/aggressive-visibility-fix.css'; // This MUST come after App.css
import './styles/visibility-fixes.css';
import './styles/feed-recipe-card-fixes.css';
import './styles/comment-section-vertical-fix.css';
import './styles/comment-full-width-fix.css';
import './styles/media-gallery-fix.css';
//import './full-width-comment-fix.css';
// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Feed from './pages/Feed';
import CreateRecipe from './pages/CreateRecipe';
import MyRecipes from './pages/MyRecipes';
import EditRecipe from './pages/EditRecipe';
import NotFound from './pages/NotFound';
import Bookmarks from './pages/Bookmarks';
import Groups from './pages/Groups';
import CreateGroup from './pages/CreateGroup';
import GroupDetail from './pages/GroupDetail';
import Notifications from './pages/Notifications';
import OAuthCallback from './pages/OAuthCallback';
import EditGroup from './pages/EditGroup';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/not-found" element={<NotFound />} />
      <Route path="/oauth-callback" element={<OAuthCallback />} />
      
      {/* Make Home public if you want non-logged in users to see it */}
      <Route path="/" element={<Home />} />
      
      {/* Protected Routes */}
      <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
      <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
      <Route path="/create-recipe" element={<ProtectedRoute><CreateRecipe /></ProtectedRoute>} />
      <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
      <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
      <Route path="/create-group" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
      <Route path="/groups/:groupId" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/my-recipes" element={<ProtectedRoute><MyRecipes /></ProtectedRoute>} />
      <Route path="/edit-recipe/:postId" element={<ProtectedRoute><EditRecipe /></ProtectedRoute>} />
      <Route path="/edit-group/:groupId" element={<ProtectedRoute><EditGroup /></ProtectedRoute>} />
      
      {/* Redirect to 404 for unknown routes (only include this once) */}
      <Route path="*" element={<Navigate replace to="/not-found" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Header />
          <main className="content-container">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;