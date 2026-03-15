import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../axiosConfig';
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
        setAuction(auctionRes.data.data);
        setBids(bidsRes.data.data);
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
      let errMsg = 'Failed to place bid';
      if (error.response?.data?.data && typeof error.response.data.data === 'object') {
        errMsg = Object.values(error.response.data.data).join(', ');
      } else if (error.response?.data?.message) {
        errMsg = error.response.data.message;
      }

      setNotification({
        type: 'error',
        message: `❌ ${errMsg}`
      });
    }

    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) return <div className="text-center mt-10">Loading auction room...</div>;
  if (!auction) return <div className="text-center mt-10 text-red-500">Auction not found.</div>;

  return (
    <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* Left Column: Auction Info & Bidding Form */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">{auction.itemName}</h2>
            {auction.status === 'ACTIVE' ? (
              <span className="bg-emerald-100 text-emerald-800 text-sm font-bold px-4 py-1.5 rounded-full flex items-center shadow-sm">
                <span className="w-2 h-2 mr-2 bg-emerald-500 rounded-full animate-pulse"></span> ACTIVE
              </span>
            ) : (
              <span className="bg-rose-100 text-rose-800 text-sm font-bold px-4 py-1.5 rounded-full flex items-center shadow-sm">
                CLOSED
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-8 text-lg leading-relaxed">{auction.description}</p>

          <div className="flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200 mb-8">
            <div className="text-center sm:text-left mb-6 sm:mb-0">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider block mb-1">Starting Price</span>
              <span className="text-2xl font-bold text-gray-700">${auction.startingPrice}</span>
            </div>
            <div className="text-center sm:text-right">
              <span className="text-sm font-bold text-indigo-400 uppercase tracking-wider block mb-1">Highest Bid</span>
              <span className="text-5xl font-black text-indigo-600">
                ${auction.currentHighestBid || auction.startingPrice}
              </span>
            </div>
          </div>

          <CountdownTimer targetDate={auction.endTime} isClosed={auction.status === 'CLOSED'} winner={auction.winner} highestBid={auction.currentHighestBid} />

          {/* Bidding Form */}
          {auction.status === 'ACTIVE' && (
            <div className="mt-10 border-t border-gray-100 pt-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 tracking-tight">Place your Bid</h3>
              <form onSubmit={handleBidSubmit} className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-bold text-xl">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min={(auction.currentHighestBid || auction.startingPrice) + 0.01}
                    className="pl-10 block w-full rounded-xl border-gray-300 border-2 p-4 shadow-sm focus:ring-4 focus:ring-indigo-500 focus:border-indigo-500 text-xl font-bold text-gray-800 transition"
                    placeholder="Enter amount"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-4 px-8 rounded-xl shadow-lg transition transform hover:-translate-y-1 sm:w-auto w-full text-lg whitespace-nowrap"
                >
                  Place Bid →
                </button>
              </form>

              {notification && (
                <div className={`mt-6 p-4 rounded-xl text-sm font-bold shadow-sm ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  {notification.message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Bid History */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 h-full flex flex-col max-h-[800px]">
          <h3 className="text-2xl font-bold mb-6 border-b border-gray-100 pb-4 text-gray-800 tracking-tight flex items-center">
            <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex justify-center items-center mr-3 text-sm">#</span>
            Recent Bids
          </h3>
          {bids.length === 0 ? (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-gray-400 text-center font-medium italic">Be the first to bid!</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto flex-grow pr-2 custom-scrollbar">
              {bids.map((bid, index) => (
                <div key={bid.id} className={`flex justify-between items-center p-4 rounded-xl border transition ${index === 0 ? 'border-indigo-200 bg-indigo-50 shadow-md transform scale-[1.02]' : 'border-gray-100 bg-white hover:bg-gray-50'}`}>
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex justify-center items-center font-bold mr-3 ${index === 0 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {index === 0 ? '🏆' : bid.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-bold ${index === 0 ? 'text-indigo-900' : 'text-gray-800'}`}>{bid.username}</span>
                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(bid.bidTime).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <span className={`font-black text-lg ${index === 0 ? 'text-indigo-600' : 'text-gray-600'}`}>
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
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-2xl border border-amber-200 text-center shadow-inner">
        <h3 className="text-2xl font-black text-amber-800 mb-4 uppercase tracking-widest">Auction Closed</h3>
        {winner && winner !== 'No winner' ? (
          <div className="bg-white p-6 rounded-xl shadow-sm inline-block">
            <p className="text-lg text-gray-500 font-bold uppercase tracking-wider mb-2">Winner</p>
            <p className="text-4xl font-black text-gray-900 mb-4">🏆 {winner}</p>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Winning Bid</p>
            <p className="text-3xl font-black text-emerald-600">${highestBid}</p>
          </div>
        ) : (
          <p className="text-xl font-bold text-gray-600 italic">No bids were placed.</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-8 rounded-2xl shadow-xl flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-indigo-500 opacity-20 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-pink-500 opacity-20 blur-2xl"></div>

      <h3 className="text-gray-400 font-bold uppercase tracking-widest mb-6 text-sm relative z-10 flex items-center">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2"></span> Time Remaining
      </h3>
      <div className="flex space-x-3 sm:space-x-6 text-center relative z-10">
        {days > 0 && (
          <div className="flex flex-col">
            <span className="text-4xl sm:text-5xl font-black text-white bg-gray-800/80 px-4 py-3 rounded-xl shadow-inner border border-gray-700/50 backdrop-blur-sm">{String(days).padStart(2, '0')}</span>
            <span className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-wider">Days</span>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-4xl sm:text-5xl font-black text-white bg-gray-800/80 px-4 py-3 rounded-xl shadow-inner border border-gray-700/50 backdrop-blur-sm">{String(hours).padStart(2, '0')}</span>
          <span className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-wider">Hours</span>
        </div>
        <div className="text-3xl sm:text-4xl font-black text-gray-600 mt-3">:</div>
        <div className="flex flex-col">
          <span className="text-4xl sm:text-5xl font-black text-white bg-gray-800/80 px-4 py-3 rounded-xl shadow-inner border border-gray-700/50 backdrop-blur-sm">{String(minutes).padStart(2, '0')}</span>
          <span className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-wider">Mins</span>
        </div>
        <div className="text-3xl sm:text-4xl font-black text-gray-600 mt-3">:</div>
        <div className="flex flex-col">
          <span className="text-4xl sm:text-5xl font-black text-pink-400 bg-gray-800/80 px-4 py-3 rounded-xl shadow-inner border border-gray-700/50 backdrop-blur-sm">{String(seconds).padStart(2, '0')}</span>
          <span className="text-xs text-pink-500/70 mt-2 font-bold uppercase tracking-wider">Secs</span>
        </div>
      </div>
    </div>
  );
};

export default AuctionRoom;
