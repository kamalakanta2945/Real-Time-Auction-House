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
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <nav className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white p-4 shadow-lg sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-extrabold tracking-tight cursor-pointer" onClick={() => window.location.href='/'}>
              <span className="text-blue-300">Live</span>Auction
            </h1>
            {user && (
              <div className="flex items-center space-x-6">
                {user.role === 'ADMIN' && (
                  <button
                    onClick={() => window.location.href = '/admin/create-auction'}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white py-1.5 px-4 rounded-full text-sm font-bold shadow transition transform hover:-translate-y-0.5"
                  >
                    + Create Auction
                  </button>
                )}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold border border-blue-400">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium hidden md:inline">{user.username}</span>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                  }}
                  className="text-gray-300 hover:text-white transition font-semibold"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>

        <div className="container mx-auto p-4 pb-12">
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
