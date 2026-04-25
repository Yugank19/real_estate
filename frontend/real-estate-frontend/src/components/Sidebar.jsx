import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  History, 
  Settings, 
  ShieldCheck, 
  LogOut,
  Building2,
  PieChart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, isAdmin } = useAuth();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Predict Price', icon: TrendingUp, path: '/predict' },
    { name: 'History', icon: History, path: '/history' },
    { name: 'Analytics', icon: PieChart, path: '/analytics' },
  ];

  const adminItems = [
    { name: 'Admin Panel', icon: ShieldCheck, path: '/admin' },
  ];

  return (
    <aside className="hidden lg:flex h-screen w-64 flex-col bg-slate-950 text-slate-300 transition-all duration-300">
      <div className="flex h-16 items-center px-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gold transition-transform group-hover:rotate-12">
            <Building2 className="h-5 w-5 text-slate-950" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-montserrat">PRO<span className="text-accent-gold">VAL</span></span>
        </Link>
      </div>

      <div className="mt-8 flex-1 px-4 space-y-1">
        <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Main Menu</p>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
              ${isActive 
                ? 'bg-accent-gold text-slate-950 shadow-lg shadow-accent-gold/20' 
                : 'hover:bg-slate-900 hover:text-white'}
            `}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}

        {isAdmin && (
          <div className="mt-8 pt-4 border-t border-slate-800">
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Administration</p>
            {adminItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                    : 'hover:bg-slate-900 hover:text-white'}
                `}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) => `
            flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
            ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-900 hover:text-white'}
          `}
        >
          <Settings className="h-5 w-5" />
          Settings
        </NavLink>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
