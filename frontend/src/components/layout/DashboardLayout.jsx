import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      <Header />
      <Sidebar />
      <main className="flex-1 ml-64 mt-[72px] p-8 overflow-y-auto w-[calc(100%-16rem)]">
        <div className="container mx-auto max-w-7xl relative pb-12">
          {children}
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
