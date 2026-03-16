import React from 'react';

function Profile() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) return <div className="text-center mt-10">Please login.</div>;

  return (
    <div className="max-w-3xl mx-auto mt-12 animate-fade-in-up">
      <div className="bg-white p-12 rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center relative overflow-hidden">

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-gradient-to-tr from-purple-100 to-pink-100 opacity-50 blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-6xl text-white shadow-2xl mb-8 border-4 border-white">
            {user.username.charAt(0).toUpperCase()}
          </div>

          <h2 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-2">{user.username}</h2>

          <span className={`px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest shadow-md mt-4 ${user.role === 'ADMIN' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
            {user.role} Role
          </span>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 text-center shadow-inner">
              <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-2">Account Status</p>
              <p className="text-2xl font-black text-emerald-600 flex items-center justify-center">
                <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2 animate-pulse"></span> Active
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 text-center shadow-inner">
              <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-2">JWT Token</p>
              <p className="text-lg font-bold text-gray-800 truncate" title={user.token}>
                {user.token ? 'Secured 🔒' : 'Missing'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;
