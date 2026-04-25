import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, Building2, BarChart3,
  ArrowUpRight, ArrowDownRight, Plus, IndianRupee,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { Card, Button } from '../components/UI';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────
const toReadable = (num) => {
  if (!num) return '₹0';
  if (num >= 1_00_00_000) return `₹${(num / 1_00_00_000).toFixed(1)} Cr`;
  if (num >= 1_00_000)    return `₹${(num / 1_00_000).toFixed(1)} L`;
  return '₹' + Number(num).toLocaleString('en-IN');
};

const formatINR = (num) =>
  num ? '₹' + Number(num).toLocaleString('en-IN') : '₹0';

const COLORS = ['#0f172a', '#D4AF37', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'];

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, sub, icon: Icon, trend, change, loading }) => (
  <Card className="flex flex-col gap-4">
    <div className="flex items-start justify-between">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
        <Icon className="h-6 w-6 text-slate-700" />
      </div>
      {change != null && (
        <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold
          ${trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {trend === 'up'
            ? <ArrowUpRight className="h-3 w-3" />
            : <ArrowDownRight className="h-3 w-3" />}
          {change}%
        </div>
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {loading
        ? <div className="h-8 w-32 bg-slate-100 rounded-lg animate-pulse mt-1" />
        : <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
      }
      {sub && !loading && (
        <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
      )}
    </div>
  </Card>
);

// ── Custom tooltip for area chart ─────────────────────────────────────────────
const CityTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-3 text-xs">
      <p className="font-bold text-slate-800 mb-1">{label}</p>
      <p className="text-slate-500">Avg Price: <span className="font-bold text-slate-900">
        {toReadable(payload[0]?.payload?.avgPrice)}
      </span></p>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();

  const [summary,      setSummary]      = useState(null);
  const [cityPrices,   setCityPrices]   = useState([]);
  const [typeDist,     setTypeDist]     = useState([]);
  const [recentPreds,  setRecentPreds]  = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingCharts,setLoadingCharts]= useState(true);
  const [loadingPreds, setLoadingPreds] = useState(true);
  const [error,        setError]        = useState(null);

  const fetchAll = async () => {
    setLoadingStats(true);
    setLoadingCharts(true);
    setLoadingPreds(true);
    setError(null);

    try {
      const [sumRes, cityRes, typeRes, predRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/city-prices'),
        api.get('/dashboard/type-distribution'),
        api.get('/dashboard/recent-predictions'),
      ]);
      setSummary(sumRes.data);
      setCityPrices(cityRes.data);
      setTypeDist(typeRes.data);
      setRecentPreds(predRes.data);
    } catch (e) {
      setError('Failed to load dashboard data. Make sure the backend is running.');
    } finally {
      setLoadingStats(false);
      setLoadingCharts(false);
      setLoadingPreds(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Market Dashboard</h1>
          <p className="text-slate-500">
            Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span>.
            Live data from 10,000+ Indian property records.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200
                       text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <Link to="/predict">
            <Button variant="gold" className="shadow-lg shadow-accent-gold/20">
              <Plus className="h-5 w-5" /> New Prediction
            </Button>
          </Link>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Dataset Records"
          value={summary ? Number(summary.totalDatasetRecords).toLocaleString('en-IN') : '—'}
          sub="Indian property records"
          icon={Building2}
          trend="up" change={null}
          loading={loadingStats}
        />
        <StatCard
          title="Avg Property Price"
          value={summary ? toReadable(summary.avgPropertyPrice) : '—'}
          sub={summary ? formatINR(summary.avgPropertyPrice) : ''}
          icon={IndianRupee}
          trend="up" change={null}
          loading={loadingStats}
        />
        <StatCard
          title="Total Market Value"
          value={summary ? toReadable(summary.totalMarketValue) : '—'}
          sub="Sum of all dataset prices"
          icon={TrendingUp}
          trend="up" change={null}
          loading={loadingStats}
        />
        <StatCard
          title="Model Accuracy (R²)"
          value={summary ? `${summary.modelAccuracy}%` : '—'}
          sub="Random Forest on CSV"
          icon={BarChart3}
          trend="up" change={null}
          loading={loadingStats}
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

        {/* City avg price chart */}
        <Card
          title="Average Price by City"
          subtitle="Avg property price in Lakhs (₹) — from dataset"
        >
          {loadingCharts ? (
            <div className="h-[320px] flex items-center justify-center">
              <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-accent-gold animate-spin" />
            </div>
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cityPrices} margin={{ left: 0, right: 10 }}>
                  <defs>
                    <linearGradient id="cityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#D4AF37" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false} tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false} tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(v) => `₹${v}L`}
                  />
                  <Tooltip content={<CityTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#D4AF37"
                    strokeWidth={3}
                    fill="url(#cityGrad)"
                    dot={{ r: 5, fill: '#D4AF37', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Property type distribution */}
        <Card
          title="Property Type Distribution"
          subtitle="Count of each property type in dataset"
        >
          {loadingCharts ? (
            <div className="h-[320px] flex items-center justify-center">
              <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-accent-gold animate-spin" />
            </div>
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={typeDist}
                  layout="vertical"
                  margin={{ left: 20, right: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    axisLine={false} tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(v) => v.toLocaleString('en-IN')}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false} tickLine={false}
                    tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }}
                    width={110}
                  />
                  <Tooltip
                    formatter={(v) => [v.toLocaleString('en-IN') + ' properties', 'Count']}
                    contentStyle={{
                      borderRadius: '12px', border: 'none',
                      boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                    {typeDist.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* ── Recent Predictions ── */}
      <Card
        title="Recent Predictions"
        subtitle="Latest valuations made by users on this platform"
      >
        {loadingPreds ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-14 rounded-xl bg-slate-50 animate-pulse" />
            ))}
          </div>
        ) : recentPreds.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Building2 className="h-7 w-7 text-slate-300" />
            </div>
            <p className="text-slate-500 text-sm font-medium">No predictions yet</p>
            <p className="text-slate-400 text-xs mt-1">
              Make your first prediction to see it here.
            </p>
            <Link to="/predict" className="mt-4">
              <Button variant="gold" className="text-sm py-2">
                <Plus className="h-4 w-4" /> New Prediction
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Location', 'Type', 'Predicted Price', 'Confidence', 'Date'].map(h => (
                    <th key={h} className="pb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentPreds.map((row, i) => {
                  const conf = row.confidence ?? 0;
                  const barColor = conf >= 90 ? 'bg-green-500' : conf >= 75 ? 'bg-amber-500' : 'bg-red-400';
                  return (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-white transition-colors shrink-0">
                            <Building2 className="h-4 w-4 text-slate-600" />
                          </div>
                          <span className="font-semibold text-slate-900 text-sm">{row.location}</span>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-slate-500">{row.type}</td>
                      <td className="py-4">
                        <span className="font-bold text-slate-900 text-sm">
                          {toReadable(row.price)}
                        </span>
                        <p className="text-xs text-slate-400">{formatINR(row.price)}</p>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                            <div className={`h-full ${barColor}`} style={{ width: `${conf}%` }} />
                          </div>
                          <span className="text-xs font-bold text-slate-600">{conf}%</span>
                        </div>
                      </td>
                      <td className="py-4 text-xs text-slate-400">
                        {row.timestamp
                          ? new Date(row.timestamp).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })
                          : '—'}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Dataset info footer ── */}
      {summary && !loadingStats && (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 flex flex-wrap gap-6 text-sm text-slate-500">
          <span>
            Dataset: <span className="font-bold text-slate-700">
              {Number(summary.totalDatasetRecords).toLocaleString('en-IN')} records
            </span>
          </span>
          <span>
            Cities: <span className="font-bold text-slate-700">8 Indian metros</span>
          </span>
          <span>
            Model: <span className="font-bold text-slate-700">Random Forest (R² = {summary.modelAccuracy}%)</span>
          </span>
          <span>
            Your Predictions: <span className="font-bold text-slate-700">
              {Number(summary.totalPredictions).toLocaleString('en-IN')}
            </span>
          </span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
