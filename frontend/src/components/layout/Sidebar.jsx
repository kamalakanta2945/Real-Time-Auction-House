import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

function Sidebar() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Create Auction', path: '/admin/create-auction' },
    { name: 'Manage Auctions', path: '/admin/manage-auctions' },
    { name: 'Active Auctions', path: '/admin/active-auctions' },
    { name: 'Completed Auctions', path: '/admin/completed-auctions' },
    { name: 'View Bid History', path: '/admin/bids' },
    { name: 'View Users', path: '/admin/users' },
  ];

  const userLinks = [
    { name: 'Dashboard', path: '/user/dashboard' },
    { name: 'Browse Auctions', path: '/user/browse-auctions' },
    { name: 'Won Auctions', path: '/user/won-auctions' },
    { name: 'Profile', path: '/user/profile' },
  ];

  const links = user.role === 'ADMIN' ? adminLinks : userLinks;

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen fixed top-0 left-0 pt-16 z-40 shadow-2xl">
      <div className="p-6">
        <h2 className="text-xl font-bold uppercase tracking-wider text-gray-400 mb-6">Menu</h2>
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.name}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-indigo-600 text-white font-bold shadow-lg' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`
                }
              >
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-auto p-6 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-bold shadow transition flex justify-center items-center"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
