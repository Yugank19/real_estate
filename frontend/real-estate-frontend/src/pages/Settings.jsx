import React from 'react';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  CreditCard, 
  Globe,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { Card, Button, Input } from '../components/UI';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, logout } = useAuth();

  const settingsGroups = [
    {
      title: 'Account Information',
      icon: User,
      items: [
        { label: 'Profile Details', desc: 'Update your name, email and avatar' },
        { label: 'Login Methods', desc: 'Manage Google and GitHub connections' },
      ]
    },
    {
      title: 'Security',
      icon: Lock,
      items: [
        { label: 'Password', desc: 'Change your current password' },
        { label: 'Two-Factor Authentication', desc: 'Add an extra layer of security' },
      ]
    },
    {
      title: 'Preferences',
      icon: Globe,
      items: [
        { label: 'Language & Region', desc: 'English (US)' },
        { label: 'Notifications', desc: 'Manage email and push alerts' },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500">Manage your account preferences and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          {settingsGroups.map((group) => (
            <button
              key={group.title}
              className="flex w-full items-center gap-3 p-4 rounded-xl text-left transition-all hover:bg-slate-100 group"
            >
              <group.icon className="h-5 w-5 text-slate-400 group-hover:text-primary-900" />
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">{group.title}</span>
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-slate-100">
             <button
              onClick={logout}
              className="flex w-full items-center gap-3 p-4 rounded-xl text-left text-red-500 hover:bg-red-50 group"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-bold">Logout Session</span>
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-2 space-y-6">
          <Card title="Profile Details">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-slate-100">
              <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-900 shadow-inner">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="text-center sm:text-left">
                <Button variant="outline" className="text-xs py-2 h-auto border-slate-200">Change Avatar</Button>
                <p className="text-xs text-slate-400 mt-2">JPG, GIF or PNG. Max size 2MB.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name" defaultValue={user?.name || ''} />
                <Input label="Email Address" defaultValue={user?.email || ''} />
              </div>
              <Input label="Job Title" placeholder="e.g. Real Estate Investor" />
              <div className="pt-4 flex justify-end gap-3">
                 <Button variant="outline" className="border-slate-200">Cancel</Button>
                 <Button variant="primary">Save Changes</Button>
              </div>
            </div>
          </Card>

          <Card title="Subscription Plan">
            <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
               <div className="absolute -right-8 -top-8 h-32 w-32 bg-accent-gold/20 rounded-full blur-3xl"></div>
               <div className="relative z-10">
                 <div className="flex justify-between items-start">
                   <div>
                     <p className="text-accent-gold text-xs font-bold uppercase tracking-widest">Current Plan</p>
                     <h3 className="text-2xl font-bold mt-1">Enterprise Elite</h3>
                   </div>
                   <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Active</div>
                 </div>
                 <p className="text-slate-400 text-sm mt-4">Next billing date: <span className="text-white">May 20, 2024</span></p>
                 <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-sm font-bold text-accent-gold">$299 / month</p>
                    <Button variant="gold" className="py-2 text-xs h-auto px-6">Manage Subscription</Button>
                 </div>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
