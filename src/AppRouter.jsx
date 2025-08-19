import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import AboutUs from './pages/AboutUs';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/aboutus" element={<AboutUs />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
