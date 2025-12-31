import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider } from './contexts/ThemeContext';
import App from './App';
import AboutUs from './pages/AboutUs';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Submit from './pages/Submit';
import UpdatePassword from './pages/UpdatePassword';
import Store from './pages/Store';

const AppRouter = () => {
  return (
    <Router>
      <ThemeProvider>
        <UserProvider>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/article/*" element={<App />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/submit" element={<Submit />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/store" element={<Store />} />
          </Routes>
        </UserProvider>
      </ThemeProvider>
    </Router>
  );
};

export default AppRouter;
