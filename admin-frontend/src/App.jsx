import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import FoldersPage from './pages/FoldersPage';
import TeamMembersPage from './pages/TeamMembersPage';

// 1. Protected Route: Bina login credentials ke koi bhi andar nahi ja sakta
function ProtectedRoute({ children }) {
  const isAuth = localStorage.getItem('isAdminAuth') === 'true';
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// 2. Public Route: Agar already logged in hai toh login page ke bajaye dashboard par bhej de
function PublicRoute({ children }) {
  const isAuth = localStorage.getItem('isAdminAuth') === 'true';
  if (isAuth) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Login Page Route */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* 100% Protected Admin Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="folders" element={<FoldersPage />} />
          <Route path="members" element={<TeamMembersPage />} />
        </Route>

        {/* Fallback to Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}