import React, { useEffect, useState } from 'react';
import axios from '../axiosConfig';
import { Link } from 'react-router-dom';

function AuctionList() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Search States
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [keyword, setKeyword] = useState('');
  const [totalPages, setTotalPages] = useState(0);

  const [importMessage, setImportMessage] = useState(null);

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/auctions', {
        params: { page, size, sortBy, sortDir, keyword }
      });
      setAuctions(response.data.data.content);
      setTotalPages(response.data.data.totalPages);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching auctions:", err);
      setError("Failed to load active auctions.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [page, size, sortBy, sortDir]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchAuctions();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/auctions/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportMessage(response.data.data.join(', '));
      fetchAuctions();
    } catch (err) {
      setImportMessage('Failed to import: ' + (err.response?.data?.message || err.message));
    }
  };

  const downloadReport = (type) => {
    window.open(`/api/auctions/export/${type}`, '_blank');
  };

  if (loading && auctions.length === 0) return <div className="text-center mt-10">Loading active auctions...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b pb-4 border-gray-200">
        <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">Active Auctions</h2>
        {user?.role === 'ADMIN' && (
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button onClick={() => downloadReport('excel')} className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-semibold px-4 py-2 rounded-lg text-sm shadow-sm transition">
              ⬇ Export Excel
            </button>
            <button onClick={() => downloadReport('pdf')} className="bg-rose-100 text-rose-800 hover:bg-rose-200 font-semibold px-4 py-2 rounded-lg text-sm shadow-sm transition">
              ⬇ Export PDF
            </button>
            <label className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-sm cursor-pointer shadow-md transition transform hover:-translate-y-0.5">
              ⬆ Import Excel
              <input type="file" accept=".xlsx" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        )}
      </div>

      {importMessage && (
        <div className="bg-blue-100 text-blue-800 p-3 rounded mb-4 text-sm">
          {importMessage}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-6 items-center justify-between">
        <form onSubmit={handleSearch} className="flex flex-grow max-w-md relative">
          <input
            type="text"
            placeholder="Search item name..."
            className="w-full pl-4 pr-24 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-sm"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit" className="absolute right-1 top-1 bottom-1 bg-indigo-600 text-white font-semibold px-6 rounded-full hover:bg-indigo-700 transition">
            Search
          </button>
        </form>

        <div className="flex items-center space-x-4 bg-gray-50 p-2 rounded-xl border border-gray-200">
          <label className="text-gray-500 text-sm font-semibold uppercase tracking-wider pl-2">Sort</label>
          <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(0); }} className="bg-transparent border-none text-gray-700 font-medium focus:ring-0 cursor-pointer">
            <option value="id">Recent</option>
            <option value="itemName">Name A-Z</option>
            <option value="startingPrice">Price</option>
            <option value="endTime">Closing Soon</option>
          </select>
          <div className="w-px h-5 bg-gray-300"></div>
          <select value={sortDir} onChange={(e) => { setSortDir(e.target.value); setPage(0); }} className="bg-transparent border-none text-gray-700 font-medium focus:ring-0 cursor-pointer pr-2">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {auctions.length === 0 ? (
        <p className="text-gray-600">No auctions found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions.map(auction => (
            <div key={auction.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 flex flex-col">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 line-clamp-1" title={auction.itemName}>{auction.itemName}</h3>
                  {auction.status === 'ACTIVE' ? (
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-sm whitespace-nowrap">
                      <span className="w-2 h-2 mr-1.5 bg-emerald-500 rounded-full animate-pulse"></span> ACTIVE
                    </span>
                  ) : (
                    <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                      CLOSED
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">{auction.description}</p>

                <div className="flex justify-between items-end bg-gray-50 p-4 rounded-xl mb-2">
                  <div>
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-1">Highest Bid</span>
                    <span className="text-3xl font-extrabold text-indigo-600">
                      ${auction.currentHighestBid || auction.startingPrice}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-1">Ends At</span>
                    <span className="font-semibold text-gray-700 text-sm">
                      {new Date(auction.endTime).toLocaleDateString()} <br/> {new Date(auction.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              </div>
              <Link
                to={`/auction/${auction.id}`}
                className="bg-gray-900 hover:bg-indigo-600 text-white text-center font-bold py-4 transition-colors duration-300 w-full"
              >
                {auction.status === 'ACTIVE' ? 'Place Bid' : 'View Results'} →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-12 mb-8 flex justify-center items-center space-x-4 bg-white p-3 rounded-full shadow-sm border border-gray-100 w-fit mx-auto">
          <button
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="px-5 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-full hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ← Prev
          </button>
          <span className="px-4 font-bold text-gray-700">Page {page + 1} of {totalPages}</span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
            className="px-5 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-full hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default AuctionList;
