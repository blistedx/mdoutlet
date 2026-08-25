import React from 'react';
import { Menu, Camera, QrCode, Sparkles, Clock, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onOpenMobileMenu, onOpenScanner }) => {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#a0c396]/30 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 shadow-xs">
      {/* Mobile Hamburger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-[#2d4a2d] hover:bg-[#f4f8f2] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#6a9c6a] animate-pulse"></span>
          <span className="text-xs font-bold text-[#1e3a1e] tracking-tight hidden sm:inline">
            Mother Dairy Live Outlet •
          </span>
          <span className="text-xs text-[#3f5a3f] font-medium">
            {today}
          </span>
        </div>
      </div>

      {/* Right Controls: QR Scanner Quick Launch Button & User Pill */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick QR Scanner Button */}
        <button
          onClick={onOpenScanner}
          className="px-3.5 sm:px-4 py-2 bg-[#1e3a1e] hover:bg-[#2d4a2d] text-[#f8f5f0] rounded-full text-xs font-bold shadow-md shadow-[#1e3a1e]/15 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Camera className="w-4 h-4 text-[#9bc09b]" />
          <span className="hidden sm:inline">Scan QR Product</span>
          <span className="sm:hidden">Scan</span>
        </button>

        {/* User Info Tag */}
        <div className="flex items-center gap-2 bg-[#f4f8f2] border border-[#a0c396]/40 py-1.5 px-3 rounded-full text-xs">
          <div className="w-6 h-6 rounded-full bg-[#1e3a1e] text-[#f8f5f0] flex items-center justify-center font-bold text-[10px]">
            {user?.name?.charAt(0)}
          </div>
          <span className="font-bold text-[#1e3a1e] hidden md:inline max-w-[120px] truncate">
            {user?.name}
          </span>
        </div>
      </div>
    </header>

  );
};

export default Navbar;
