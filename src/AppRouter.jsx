import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import App from './App';
import AboutUs from './pages/AboutUs';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Submit from './pages/Submit';
import UpdatePassword from './pages/UpdatePassword';

const AppRouter = () => {
  return (
    <Router>
      <UserProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/article/*" element={<App />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/update-password" element={<UpdatePassword />} />
        </Routes>
      </UserProvider>
    </Router>
  );
};

export default AppRouter;
