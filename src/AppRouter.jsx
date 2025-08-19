import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import App from './App';
import AboutUs from './pages/AboutUs';

const AppRouter = () => {
  return (
    <Router>
      <UserProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/aboutus" element={<AboutUs />} />
        </Routes>
      </UserProvider>
    </Router>
  );
};

export default AppRouter;
