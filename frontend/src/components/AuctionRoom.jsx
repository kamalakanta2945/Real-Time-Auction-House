import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useCountdown } from '../hooks/useCountdown';

function AuctionRoom() {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  const stompClientRef = useRef(null);

  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        const [auctionRes, bidsRes] = await Promise.all([
          axios.get(`/api/auctions/${id}`),
          axios.get(`/api/auctions/${id}/bids`)
        ]);
        setAuction(auctionRes.data);
        setBids(bidsRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch auction details:", error);
        setLoading(false);
      }
    };

    fetchAuctionData();

    // WebSocket Setup
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      debug: (str) => {
        // console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/auctions/${id}`, (message) => {
        const updatedAuction = JSON.parse(message.body);
        setAuction(updatedAuction);
      });

      client.subscribe(`/topic/bids/${id}`, (message) => {
        const newBid = JSON.parse(message.body);
        setBids((prevBids) => [newBid, ...prevBids]);
      });
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [id]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setNotification(null);

    if (!bidAmount) return;

    try {
      await axios.post(`/api/auctions/${id}/bid`, {
        username: user.username,
        bidAmount: parseFloat(bidAmount)
      });
      setBidAmount('');
      setNotification({ type: 'success', message: '✅ Your bid was accepted' });
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.response?.data || '❌ Failed to place bid'
      });
    }

    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) return <div className="text-center mt-10">Loading auction room...</div>;
  if (!auction) return <div className="text-center mt-10 text-red-500">Auction not found.</div>;

  return (
    <div className="max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">

      {/* Left Column: Auction Info & Bidding Form */}
      <div className="md:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold">{auction.itemName}</h2>
            {auction.status === 'ACTIVE' ? (
              <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full flex items-center">
                <span className="w-2 h-2 mr-1 bg-green-500 rounded-full animate-pulse"></span> 🟢 ACTIVE
              </span>
            ) : (
              <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full flex items-center">
                🔴 CLOSED
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-6">{auction.description}</p>

          <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
            <div className="text-center mb-4 md:mb-0">
              <span className="text-sm text-gray-500 block">Starting Price</span>
              <span className="text-xl font-semibold">${auction.startingPrice}</span>
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-500 block">Highest Bid</span>
              <span className="text-3xl font-bold text-green-600">
                ${auction.currentHighestBid || auction.startingPrice}
              </span>
            </div>
          </div>

          <CountdownTimer targetDate={auction.endTime} isClosed={auction.status === 'CLOSED'} winner={auction.winner} highestBid={auction.currentHighestBid} />

          {/* Bidding Form */}
          {auction.status === 'ACTIVE' && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-xl font-semibold mb-4">Place a Bid</h3>
              <form onSubmit={handleBidSubmit} className="flex gap-4 items-center">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min={(auction.currentHighestBid || auction.startingPrice) + 0.01}
                    className="pl-7 block w-full rounded-md border-gray-300 border p-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-lg"
                    placeholder="Enter bid amount"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded shadow"
                >
                  Bid Now
                </button>
              </form>

              {notification && (
                <div className={`mt-4 p-3 rounded text-sm ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {notification.message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Bid History */}
      <div className="md:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-full">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">Recent Bids</h3>
          {bids.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No bids placed yet.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {bids.map((bid, index) => (
                <div key={bid.id} className="flex justify-between items-center p-3 rounded border border-gray-100 bg-gray-50 hover:bg-gray-100 transition">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">{bid.username}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(bid.bidTime).toLocaleTimeString()}
                    </span>
                  </div>
                  <span className={`font-bold ${index === 0 ? 'text-green-600' : 'text-gray-700'}`}>
                    ${bid.bidAmount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

const CountdownTimer = ({ targetDate, isClosed, winner, highestBid }) => {
  const { days, hours, minutes, seconds, isComplete } = useCountdown(targetDate);

  if (isClosed || isComplete) {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 text-center">
        <h3 className="text-xl font-bold text-yellow-800 mb-2">Auction Ended</h3>
        {winner && winner !== 'No winner' ? (
          <div>
            <p className="text-2xl mb-1">🏆 Winner: <span className="font-bold">{winner}</span></p>
            <p className="text-lg text-gray-700">Winning Bid: <span className="font-bold text-green-600">${highestBid}</span></p>
          </div>
        ) : (
          <p className="text-lg text-gray-700">No winner for this auction.</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 flex flex-col items-center">
      <h3 className="text-gray-600 font-semibold mb-2 flex items-center">
        <span className="mr-2">⏳</span> Time Left
      </h3>
      <div className="flex space-x-4 text-center">
        {days > 0 && (
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-blue-900 bg-white px-3 py-2 rounded shadow-sm">{String(days).padStart(2, '0')}</span>
            <span className="text-xs text-blue-600 mt-1 uppercase">Days</span>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-3xl font-bold text-blue-900 bg-white px-3 py-2 rounded shadow-sm">{String(hours).padStart(2, '0')}</span>
          <span className="text-xs text-blue-600 mt-1 uppercase">Hours</span>
        </div>
        <div className="text-2xl font-bold text-blue-900 mt-2">:</div>
        <div className="flex flex-col">
          <span className="text-3xl font-bold text-blue-900 bg-white px-3 py-2 rounded shadow-sm">{String(minutes).padStart(2, '0')}</span>
          <span className="text-xs text-blue-600 mt-1 uppercase">Mins</span>
        </div>
        <div className="text-2xl font-bold text-blue-900 mt-2">:</div>
        <div className="flex flex-col">
          <span className="text-3xl font-bold text-blue-900 bg-white px-3 py-2 rounded shadow-sm">{String(seconds).padStart(2, '0')}</span>
          <span className="text-xs text-blue-600 mt-1 uppercase">Secs</span>
        </div>
      </div>
    </div>
  );
};

export default AuctionRoom;
