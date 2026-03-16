import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 shadow-lg fixed top-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center ml-64 max-w-[calc(100%-16rem)] px-8">
        <h1 className="text-2xl font-extrabold tracking-tight cursor-pointer" onClick={() => navigate('/')}>
          <span className="text-blue-300">Live</span>Auction
        </h1>

        {user && (
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 bg-gray-800/40 py-1.5 px-4 rounded-full border border-gray-700/50 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white shadow-sm">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-gray-100 hidden md:inline tracking-wide">{user.username}</span>
              <span className="text-xs bg-indigo-500 px-2 py-0.5 rounded-full font-black uppercase text-white shadow-sm ml-2">
                {user.role}
              </span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Header;
