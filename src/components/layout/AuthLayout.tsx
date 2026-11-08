import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#040812] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative space-grid-bg selection:bg-blue-600/30 selection:text-white">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="w-full relative z-10 flex flex-col items-center">
        <Outlet />
      </div>
    </div>
  );
};
