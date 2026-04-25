import React from 'react';
import { 
  Users, 
  Database, 
  ShieldCheck, 
  Activity, 
  Server,
  Settings,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { Card, Button } from '../components/UI';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const data = [
  { time: '00:00', load: 30, requests: 120 },
  { time: '04:00', load: 15, requests: 40 },
  { time: '08:00', load: 45, requests: 350 },
  { time: '12:00', load: 85, requests: 890 },
  { time: '16:00', load: 60, requests: 620 },
  { time: '20:00', load: 40, requests: 310 },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Console</h1>
        <p className="text-slate-500">System-wide monitoring and user management.</p>
      </div>

      {/* Grid for System Status */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="bg-slate-900 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/10 rounded-lg">
              <Server className="h-6 w-6 text-accent-gold" />
            </div>
            <span className="text-xs font-bold text-green-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              Healthy
            </span>
          </div>
          <p className="text-slate-400 text-sm">System Uptime</p>
          <h3 className="text-3xl font-bold mt-1">99.99%</h3>
          <p className="text-xs text-slate-500 mt-2">Next maintenance in 12 days</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Users className="h-6 w-6 text-slate-900" />
            </div>
          </div>
          <p className="text-slate-500 text-sm">Total Registered Users</p>
          <h3 className="text-3xl font-bold mt-1 text-slate-900">12,482</h3>
          <p className="text-xs text-green-600 font-bold mt-2 flex items-center">
            <ArrowUpRight className="h-3 w-3 mr-1" /> +142 this week
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Database className="h-6 w-6 text-slate-900" />
            </div>
          </div>
          <p className="text-slate-500 text-sm">Predictions Processed</p>
          <h3 className="text-3xl font-bold mt-1 text-slate-900">1,420,591</h3>
          <p className="text-xs text-blue-600 font-bold mt-2">Database size: 4.2 GB</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* System Load Chart */}
        <Card className="lg:col-span-2" title="System Performance" subtitle="Real-time request volume and server load">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' 
                  }} 
                />
                <Line type="monotone" dataKey="requests" stroke="#0f172a" strokeWidth={3} dot={{ r: 4, fill: '#0f172a' }} />
                <Line type="monotone" dataKey="load" stroke="#D4AF37" strokeWidth={3} dot={{ r: 4, fill: '#D4AF37' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* System Logs / Alerts */}
        <Card title="System Alerts" subtitle="Recent critical events">
          <div className="space-y-4">
            {[
              { type: 'warning', msg: 'API Latency increase in Region US-East', time: '5m ago' },
              { type: 'error', msg: 'Database backup failed - Retry scheduled', time: '12m ago' },
              { type: 'info', msg: 'New admin account created: admin_test', time: '45m ago' },
              { type: 'warning', msg: 'Disk usage exceeding 80% on Node 04', time: '1h ago' },
            ].map((alert, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                  alert.type === 'error' ? 'bg-red-500' : alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-900">{alert.msg}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-bold">{alert.time}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full text-xs py-2 mt-4">View All Logs</Button>
          </div>
        </Card>
      </div>

      {/* User Management Preview */}
      <Card title="User Overview" subtitle="Quick access to recently joined accounts">
         <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 text-xs font-bold uppercase tracking-wider text-slate-400">User</th>
                <th className="pb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Role</th>
                <th className="pb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                <th className="pb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { name: 'Sarah Miller', email: 'sarah@example.com', role: 'Premium', status: 'Active' },
                { name: 'Mark Wilson', email: 'mark@wilson.co', role: 'User', status: 'Active' },
                { name: 'David Chen', email: 'david.c@tech.com', role: 'Admin', status: 'Pending' },
              ].map((user, i) => (
                <tr key={i} className="group hover:bg-slate-50">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 uppercase">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      user.role === 'Admin' ? 'bg-primary-900 text-white' : user.role === 'Premium' ? 'bg-accent-gold text-slate-950' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                   <td className="py-4">
                    <span className={`text-xs font-bold ${user.status === 'Active' ? 'text-green-600' : 'text-amber-600'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                      <Settings className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
