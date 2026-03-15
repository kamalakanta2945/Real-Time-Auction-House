import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        const response = await axios.post('/api/auth/login', { username, password });
        const { token, user } = response.data.data;
        localStorage.setItem('user', JSON.stringify({ token, ...user }));
        navigate('/');
      } else {
        await axios.post('/api/auth/register', { username, password });
        setSuccessMsg('Registration successful! Please log in.');
        setIsLogin(true); // Switch to login view
        setPassword(''); // Clear password for security
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
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md transform transition-all hover:scale-105 duration-300">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800 tracking-tight">
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h2>

        {error && <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}
        {successMsg && <p className="text-green-600 text-sm mb-4 bg-green-50 p-3 rounded-lg border border-green-200">{successMsg}</p>}

        <div className="mb-5">
          <label className="block text-gray-700 text-sm font-semibold mb-2">Username</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-8">
          <label className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
          <input
            type="password"
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all font-bold text-lg">
          {isLogin ? 'Sign In' : 'Sign Up'}
        </button>

        <div className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccessMsg('');
            }}
            className="text-indigo-600 hover:text-indigo-800 font-bold transition"
          >
            {isLogin ? 'Create one now' : 'Log in instead'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
