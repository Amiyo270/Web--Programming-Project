import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './components/AdminLogin.jsx';
import AdminPanelEnhanced from './components/AdminPanelEnhanced.jsx';

const AdminApp = () => {
  const [adminToken, setAdminToken] = useState(() => {
    return typeof window !== 'undefined'
      ? window.localStorage.getItem('admin_token') || null
      : null;
  });

  const handleAdminLogout = () => {
    setAdminToken(null);
    window.localStorage.removeItem('admin_token');
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AdminLogin setAdminToken={setAdminToken} />} />
        <Route
          path="/dashboard"
          element={
            adminToken ? (
              <AdminPanelEnhanced
                setAdminToken={setAdminToken}
                adminToken={adminToken}
                onLogout={handleAdminLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </HashRouter>
  );
};

export default AdminApp;
