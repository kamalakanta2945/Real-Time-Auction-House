import React, { useEffect, useState } from 'react';
import axios from '../../axiosConfig';
import { Link } from 'react-router-dom';

function UserDashboard() {
  const [stats, setStats] = useState({ totalAuctions: 0, totalBids: 0 });
  const [wonAuctions, setWonAuctions] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, wonRes] = await Promise.all([
          axios.get('/api/auctions/stats'),
          axios.get(`/api/auctions/won/${user.username}`)
        ]);
        setStats(statsRes.data.data);
        setWonAuctions(wonRes.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [user.username]);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black tracking-tight mb-2 text-blue-50">Welcome back,</h2>
          <h1 className="text-6xl font-extrabold mb-8">{user.username}!</h1>
          <div className="flex space-x-4">
            <Link to="/user/browse-auctions" className="bg-white text-indigo-700 hover:bg-gray-50 px-8 py-3 rounded-full font-bold shadow-lg transition transform hover:-translate-y-1">
              Browse Auctions
            </Link>
            <Link to="/user/won-auctions" className="bg-indigo-800 border border-indigo-500 hover:bg-indigo-900 text-white px-8 py-3 rounded-full font-bold shadow-lg transition transform hover:-translate-y-1">
              View Wins ({wonAuctions.length})
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-1">Global Active Auctions</p>
            <p className="text-5xl font-black text-gray-800">{stats.totalAuctions}</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex justify-center items-center text-3xl">🛍️</div>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-1">Global Bids Placed</p>
            <p className="text-5xl font-black text-gray-800">{stats.totalBids}</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-blue-100 flex justify-center items-center text-3xl">⚡</div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
