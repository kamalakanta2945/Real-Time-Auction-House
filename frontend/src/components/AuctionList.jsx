import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function AuctionList() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await axios.get('/api/auctions');
        setAuctions(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching auctions:", err);
        setError("Failed to load active auctions.");
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading active auctions...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-6">Active Auctions</h2>
      {auctions.length === 0 ? (
        <p className="text-gray-600">No active auctions at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {auctions.map(auction => (
            <div key={auction.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{auction.itemName}</h3>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                  <span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span> ACTIVE
                </span>
              </div>
              <p className="text-gray-600 mb-4">{auction.description}</p>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm">
                  <span className="text-gray-500 block">Current Highest Bid</span>
                  <span className="text-lg font-bold text-green-600">
                    ${auction.currentHighestBid || auction.startingPrice}
                  </span>
                </div>
                <div className="text-sm text-right">
                  <span className="text-gray-500 block">Ends At</span>
                  <span className="font-medium text-gray-800">
                    {new Date(auction.endTime).toLocaleString()}
                  </span>
                </div>
              </div>
              <Link
                to={`/auction/${auction.id}`}
                className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-200"
              >
                Enter Auction Room
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AuctionList;
