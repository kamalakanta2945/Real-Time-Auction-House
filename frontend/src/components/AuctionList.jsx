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

  return (
    <div className="max-w-5xl mx-auto mt-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-3xl font-bold mb-4 md:mb-0">Active Auctions</h2>
        <div className="flex space-x-2">
          <button onClick={() => downloadReport('excel')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
            Export Excel
          </button>
          <button onClick={() => downloadReport('pdf')} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
            Export PDF
          </button>
          <label className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm cursor-pointer">
            Import Excel
            <input type="file" accept=".xlsx" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {importMessage && (
        <div className="bg-blue-100 text-blue-800 p-3 rounded mb-4 text-sm">
          {importMessage}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-6 flex flex-wrap gap-4 items-center">
        <form onSubmit={handleSearch} className="flex flex-grow max-w-sm">
          <input
            type="text"
            placeholder="Search item name..."
            className="border p-2 rounded-l w-full focus:outline-none focus:ring focus:border-blue-300"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit" className="bg-gray-800 text-white px-4 rounded-r hover:bg-gray-700">Search</button>
        </form>

        <div className="flex items-center space-x-2 ml-auto">
          <label className="text-gray-600 text-sm">Sort by:</label>
          <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(0); }} className="border rounded p-1 text-sm">
            <option value="id">ID</option>
            <option value="itemName">Name</option>
            <option value="startingPrice">Price</option>
            <option value="endTime">End Time</option>
          </select>
          <select value={sortDir} onChange={(e) => { setSortDir(e.target.value); setPage(0); }} className="border rounded p-1 text-sm">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {auctions.length === 0 ? (
        <p className="text-gray-600">No auctions found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {auctions.map(auction => (
            <div key={auction.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{auction.itemName}</h3>
                {auction.status === 'ACTIVE' ? (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                    <span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span> ACTIVE
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                    CLOSED
                  </span>
                )}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center space-x-2">
          <button
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-4 py-1">Page {page + 1} of {totalPages}</span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default AuctionList;
