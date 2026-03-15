import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AuctionList from './components/AuctionList';
import AuctionRoom from './components/AuctionRoom';
import CreateAuction from './components/CreateAuction';

function App() {
  const PrivateRoute = ({ children }) => {
    const user = localStorage.getItem('user');
    return user ? children : <Navigate to="/login" />;
  };

  const AdminRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.role === 'ADMIN' ? children : <Navigate to="/" />;
  };

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <Router>
      <div className="min-h-screen">
        <nav className="bg-blue-600 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Real-Time Auction House</h1>
            {user && (
              <div className="flex items-center space-x-4">
                {user.role === 'ADMIN' && (
                  <button
                    onClick={() => window.location.href = '/admin/create-auction'}
                    className="bg-green-500 hover:bg-green-700 text-white py-1 px-3 rounded text-sm font-semibold shadow-sm transition"
                  >
                    + Create Auction
                  </button>
                )}
                <span>Welcome, {user.username}</span>
                <button
                  onClick={() => {
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                  }}
                  className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>

        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <AuctionList />
                </PrivateRoute>
              }
            />
            <Route
              path="/auction/:id"
              element={
                <PrivateRoute>
                  <AuctionRoom />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/create-auction"
              element={
                <AdminRoute>
                  <CreateAuction />
                </AdminRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
