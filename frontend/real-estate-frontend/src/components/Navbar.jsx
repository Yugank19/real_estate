import React from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md lg:px-8">
      <div className="flex items-center gap-4 lg:hidden">
        <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div className="hidden flex-1 items-center lg:flex">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search properties, reports..." 
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-600 transition-colors hover:bg-slate-100 rounded-full">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
        
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-900 leading-tight">{user?.name || 'Guest User'}</span>
            <span className="text-xs text-slate-500 leading-tight">{user?.role || 'Guest'}</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 border-2 border-white shadow-sm transition-transform group-hover:scale-105">
            <User className="h-6 w-6 text-primary-600" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
