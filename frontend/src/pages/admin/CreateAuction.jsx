import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axiosConfig';

function CreateAuction() {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || user.role !== 'ADMIN') {
    return <div className="text-center mt-10 text-red-500">Access Denied: Admins only.</div>;
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const formattedEndTime = new Date(endTime).toISOString();
      await axios.post('/api/auctions', {
        itemName,
        description,
        startingPrice: parseFloat(startingPrice),
        endTime: formattedEndTime,
        status: 'ACTIVE'
      });
      navigate('/');
    } catch (err) {
      if (err.response?.data?.data && typeof err.response.data.data === 'object') {
        const validationErrors = Object.entries(err.response.data.data).map(([field, msg]) => `${field}: ${msg}`).join(', ');
        setError(validationErrors);
      } else {
        setError(err.response?.data?.message || 'Failed to create auction');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-6">Create New Auction</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Item Name</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Description</label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Starting Price ($)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            value={startingPrice}
            onChange={(e) => setStartingPrice(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">End Time</label>
          <input
            type="datetime-local"
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 transition duration-200 mt-4">
          Create Auction
        </button>
      </form>
    </div>
  );
}

export default CreateAuction;
