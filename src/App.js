import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginRegister from './pages/LoginRegister';
import UploadPage from './pages/UploadPage';
import Authority from './pages/Authority';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginRegister isRegister={false} />} />
        <Route path="/register" element={<LoginRegister isRegister={true} />} />
        
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/authority/*" element={<Authority />} />
        
        <Route path="/auth" element={<LoginRegister />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
