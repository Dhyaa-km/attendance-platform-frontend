import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header.tsx';
import { Sidebar } from './Sidebar.tsx';
import { MobileNav } from './MobileNav.tsx';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#040812] text-slate-100 flex flex-col font-sans selection:bg-blue-600/30 selection:text-white">
      {/* Top Operations Header */}
      <Header />

      <div className="flex-1 flex w-full relative">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Operational Viewport */}
        <main className="flex-1 min-w-0 flex flex-col relative space-grid-bg">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Touch Navigation */}
      <MobileNav />
    </div>
  );
};
