import React, { useEffect, useState } from 'react';
import axios from '../../axiosConfig';

function ManageAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchAuctions();
  }, [page]);

  const fetchAuctions = async () => {
    try {
      const response = await axios.get('/api/auctions', { params: { page, size: 15, status: 'ALL' } });
      setAuctions(response.data.data.content);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this auction?')) {
      try {
        await axios.delete(`/api/auctions/${id}`);
        fetchAuctions();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete');
      }
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-extrabold mb-6 border-b pb-4">Manage Auctions</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 rounded-tl-lg">ID</th>
              <th className="p-4">Item Name</th>
              <th className="p-4">Start Price</th>
              <th className="p-4">Current Bid</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {auctions.map(auction => (
              <tr key={auction.id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-bold text-gray-800">#{auction.id}</td>
                <td className="p-4 font-semibold text-indigo-600">{auction.itemName}</td>
                <td className="p-4">${auction.startingPrice}</td>
                <td className="p-4 font-bold text-emerald-600">${auction.currentHighestBid || auction.startingPrice}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${auction.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {auction.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => handleDelete(auction.id)} className="bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white font-bold py-1 px-3 rounded transition shadow-sm">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageAuctions;
