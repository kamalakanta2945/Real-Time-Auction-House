import React, { useEffect, useState } from 'react';
import axios from '../../axiosConfig';

function AllBidsHistory() {
  const [bids, setBids] = useState([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await axios.get('/api/auctions/bids/all', { params: { page, size: 20 } });
        setBids(response.data.data.content);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBids();
  }, [page]);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-extrabold mb-6 border-b pb-4 text-gray-800">Global Bid History</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse bg-white">
          <thead className="bg-indigo-50 text-indigo-900 border-b-2 border-indigo-100">
            <tr className="uppercase text-xs tracking-wider">
              <th className="p-5 font-black rounded-tl-xl">Bid ID</th>
              <th className="p-5 font-black">Auction ID</th>
              <th className="p-5 font-black">User</th>
              <th className="p-5 font-black">Amount</th>
              <th className="p-5 font-black rounded-tr-xl">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bids.map(bid => (
              <tr key={bid.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-5 text-sm font-semibold text-gray-500">#{bid.id}</td>
                <td className="p-5 font-bold text-gray-800">#{bid.auctionId}</td>
                <td className="p-5">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm inline-flex items-center">
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] mr-2">
                      {bid.username.charAt(0).toUpperCase()}
                    </span>
                    {bid.username}
                  </span>
                </td>
                <td className="p-5 font-black text-emerald-600 text-lg">${bid.bidAmount}</td>
                <td className="p-5 text-sm font-medium text-gray-500">
                  {new Date(bid.bidTime).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AllBidsHistory;
