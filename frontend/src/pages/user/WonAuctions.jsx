import React, { useEffect, useState } from 'react';
import axios from '../../axiosConfig';
import { Link } from 'react-router-dom';

function WonAuctions() {
  const [auctions, setAuctions] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchWonAuctions = async () => {
      try {
        const response = await axios.get(`/api/auctions/won/${user.username}`);
        setAuctions(response.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchWonAuctions();
  }, [user.username]);

  return (
    <div className="max-w-6xl mx-auto mt-8 animate-fade-in-up">
      <div className="flex justify-between items-center mb-10 border-b border-gray-200 pb-4">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center">
          <span className="text-5xl mr-4">🏆</span> Won Auctions
        </h2>
        <span className="bg-amber-100 text-amber-800 font-bold px-4 py-1.5 rounded-full shadow-sm border border-amber-200">
          Total: {auctions.length}
        </span>
      </div>

      {auctions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-xl">
          <span className="text-6xl mb-4 block">😔</span>
          <p className="text-gray-500 font-medium text-xl">You haven't won any auctions yet.</p>
          <Link to="/user/browse-auctions" className="mt-6 inline-block bg-indigo-600 text-white font-bold px-8 py-3 rounded-full hover:bg-indigo-700 shadow-lg transition">Start Bidding</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions.map(auction => (
            <div key={auction.id} className="bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 flex flex-col relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:opacity-20 transition pointer-events-none">
                🏆
              </div>
              <div className="p-8 flex-grow relative z-10">
                <h3 className="text-2xl font-black text-gray-800 mb-2 line-clamp-1">{auction.itemName}</h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2">{auction.description}</p>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200 shadow-inner">
                  <span className="text-amber-800 text-xs font-bold uppercase tracking-widest block mb-1">Winning Bid</span>
                  <span className="text-4xl font-black text-amber-600">${auction.currentHighestBid}</span>
                </div>
              </div>
              <Link
                to={`/auction/${auction.id}`}
                className="bg-amber-500 hover:bg-amber-600 text-white text-center font-extrabold py-5 transition-colors duration-300 w-full uppercase tracking-widest text-sm"
              >
                View Final Results
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WonAuctions;
