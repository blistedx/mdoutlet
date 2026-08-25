import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Common Components
import MainLayout from './components/common/MainLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StockView from './pages/StockView';
import Purchases from './pages/Purchases';
import Sales from './pages/Sales';
import Production from './pages/Production';
import ExpiryBatches from './pages/ExpiryBatches';
import ProductManagement from './pages/ProductManagement';
import Reports from './pages/Reports';
import DataHub from './pages/DataHub';
import UserManagement from './pages/UserManagement';
import AuditLogViewer from './pages/AuditLogViewer';
import CustomerRating from './pages/CustomerRating';
import FeedbackManagement from './pages/FeedbackManagement';




// Protected Route Guard (Checks Login State)
const ProtectedRoute = ({ children }) => {
  const { user, initialLoading } = useAuth();

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#f4f8f2] flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-[#1e3a1e] text-[#f8f5f0] flex items-center justify-center text-2xl animate-bounce mx-auto shadow-lg shadow-[#1e3a1e]/20">
            🥛
          </div>
          <p className="text-xs font-bold text-[#1e3a1e]">Loading Mother Dairy Live Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Only Route Guard
const AdminRoute = ({ children }) => {
  const { user, isAdmin, initialLoading } = useAuth();

  if (initialLoading) {
    return (
      <div className="p-8 text-center text-xs font-bold text-[#3f5a3f]">
        Verifying administrative authorization...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};


function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/rate" element={<CustomerRating />} />
            <Route path="/feedback" element={<CustomerRating />} />

            {/* Protected Workspace Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Accessible by Staff & Admin */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/stock" element={<StockView />} />
              <Route path="/purchases" element={<Purchases />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/production" element={<Production />} />
              <Route path="/expiry" element={<ExpiryBatches />} />

              {/* Accessible by Admin Only */}
              <Route
                path="/products"
                element={
                  <AdminRoute>
                    <ProductManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <AdminRoute>
                    <Reports />
                  </AdminRoute>
                }
              />
              <Route
                path="/feedback-admin"
                element={
                  <AdminRoute>
                    <FeedbackManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="/reviews"
                element={
                  <AdminRoute>
                    <FeedbackManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="/ratings"
                element={
                  <AdminRoute>
                    <FeedbackManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="/data-hub"
                element={
                  <AdminRoute>
                    <DataHub />
                  </AdminRoute>
                }
              />
              <Route
                path="/hub"
                element={
                  <AdminRoute>
                    <DataHub />
                  </AdminRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <AdminRoute>
                    <UserManagement />
                  </AdminRoute>
                }
              />

              <Route
                path="/audit-logs"
                element={
                  <AdminRoute>
                    <AuditLogViewer />
                  </AdminRoute>
                }
              />
            </Route>


            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
