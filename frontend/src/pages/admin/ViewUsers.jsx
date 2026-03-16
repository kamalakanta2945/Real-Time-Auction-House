import React, { useEffect, useState } from 'react';
import axios from '../../axiosConfig';

function ViewUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/auth');
        setUsers(response.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-extrabold mb-6 border-b pb-4">Registered Users</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => (
          <div key={u.id} className="border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-lg transition bg-gradient-to-b from-gray-50 to-white flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center font-black text-xl text-white shadow-inner">
              {u.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-extrabold text-lg text-gray-800">{u.username}</p>
              <p className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${u.role === 'ADMIN' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {u.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ViewUsers;
