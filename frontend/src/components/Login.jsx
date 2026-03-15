import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const response = await axios.post('/api/auth/login', { username, password });
        const { token, user } = response.data.data;
        localStorage.setItem('user', JSON.stringify({ token, ...user }));
        navigate('/');
      } else {
        const response = await axios.post('/api/auth/register', { username, password });
        const { token, user } = response.data.data;
        localStorage.setItem('user', JSON.stringify({ token, ...user }));
        navigate('/');
      }
    } catch (err) {
      if (err.response?.data?.data && typeof err.response.data.data === 'object') {
        const validationErrors = Object.values(err.response.data.data).join(', ');
        setError(validationErrors);
      } else {
        setError(err.response?.data?.message || `Failed to ${isLogin ? 'login' : 'register'}`);
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? 'Login to Auction' : 'Register for Auction'}
        </h2>

        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">{error}</p>}

        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-medium">Username</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Password</label>
          <input
            type="password"
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition font-bold">
          {isLogin ? 'Login' : 'Register'}
        </button>

        <div className="mt-4 text-center text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-blue-600 hover:underline font-semibold"
          >
            {isLogin ? 'Register here' : 'Login here'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
