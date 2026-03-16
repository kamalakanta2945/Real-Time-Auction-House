import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import DashboardLayout from './components/layout/DashboardLayout';

import AdminDashboard from './pages/admin/AdminDashboard';
import CreateAuction from './pages/admin/CreateAuction';
import ManageAuctions from './pages/admin/ManageAuctions';
import AllBidsHistory from './pages/admin/AllBidsHistory';
import ViewUsers from './pages/admin/ViewUsers';

import UserDashboard from './pages/user/UserDashboard';
import BrowseAuctions from './pages/user/BrowseAuctions';
import WonAuctions from './pages/user/WonAuctions';
import Profile from './pages/user/Profile';
import AuctionRoom from './pages/user/AuctionRoom';

function App() {
  const PrivateRoute = ({ children }) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return <Navigate to="/login" />;
    return <DashboardLayout>{children}</DashboardLayout>;
  };

  const AdminRoute = ({ children }) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return <Navigate to="/login" />;
    const user = JSON.parse(userStr);
    return user && user.role === 'ADMIN' ? <DashboardLayout>{children}</DashboardLayout> : <Navigate to="/" />;
  };

  const RootRoute = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return <Navigate to="/login" />;
    const user = JSON.parse(userStr);
    return user.role === 'ADMIN' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/user/dashboard" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RootRoute />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/create-auction" element={<AdminRoute><CreateAuction /></AdminRoute>} />
        <Route path="/admin/manage-auctions" element={<AdminRoute><ManageAuctions /></AdminRoute>} />
        <Route path="/admin/active-auctions" element={<AdminRoute><BrowseAuctions status="ACTIVE" /></AdminRoute>} />
        <Route path="/admin/completed-auctions" element={<AdminRoute><BrowseAuctions status="CLOSED" /></AdminRoute>} />
        <Route path="/admin/bids" element={<AdminRoute><AllBidsHistory /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><ViewUsers /></AdminRoute>} />

        {/* User Routes */}
        <Route path="/user/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
        <Route path="/user/browse-auctions" element={<PrivateRoute><BrowseAuctions status="ACTIVE" /></PrivateRoute>} />
        <Route path="/user/won-auctions" element={<PrivateRoute><WonAuctions /></PrivateRoute>} />
        <Route path="/user/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/auction/:id" element={<PrivateRoute><AuctionRoom /></PrivateRoute>} />

      </Routes>
    </Router>
  );
}

export default App;
