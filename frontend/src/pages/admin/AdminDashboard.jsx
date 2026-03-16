import React, { useEffect, useState } from 'react';
import axios from '../../axiosConfig';

function AdminDashboard() {
  const [stats, setStats] = useState({ totalAuctions: 0, totalBids: 0 });
  const [userStats, setUserStats] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [auctionsRes, usersRes] = await Promise.all([
          axios.get('/api/auctions/stats'),
          axios.get('/api/auth/stats')
        ]);
        setStats(auctionsRes.data.data);
        setUserStats(usersRes.data.data);
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-10 tracking-tight border-b pb-4">Admin Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl transform transition duration-300 hover:scale-105">
          <h3 className="text-indigo-100 text-lg font-bold uppercase tracking-wider mb-2">Total Auctions</h3>
          <p className="text-6xl font-black">{stats.totalAuctions}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-8 text-white shadow-xl transform transition duration-300 hover:scale-105">
          <h3 className="text-emerald-100 text-lg font-bold uppercase tracking-wider mb-2">Total Bids</h3>
          <p className="text-6xl font-black">{stats.totalBids}</p>
        </div>
        <div className="bg-gradient-to-br from-rose-400 to-red-500 rounded-2xl p-8 text-white shadow-xl transform transition duration-300 hover:scale-105">
          <h3 className="text-rose-100 text-lg font-bold uppercase tracking-wider mb-2">Registered Users</h3>
          <p className="text-6xl font-black">{userStats}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
