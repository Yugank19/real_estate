import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Trash2, 
  MapPin, 
  Calendar,
  Building2,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { Card, Input, Button } from '../components/UI';
import { predictionService } from '../services/predictionService';
import Loader from '../components/Loader';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      const data = await predictionService.getHistory();
      setHistory(data);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  // Backend returns Prediction objects with nested property field
  const normalize = (item) => ({
    id: item.id,
    location: item.property?.location || item.location || 'N/A',
    type: item.property?.type || item.type || 'N/A',
    bedrooms: item.property?.bedrooms || item.bedrooms || '-',
    price: item.predictedPrice || item.price || 0,
    date: item.timestamp || item.date || new Date().toISOString(),
    confidence: item.confidenceScore != null
      ? Math.round(item.confidenceScore * 100)
      : (item.confidence || 0),
  });

  const filteredHistory = history
    .map(normalize)
    .filter(item => item.location.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Valuation History</h1>
          <p className="text-slate-500">View and manage all your previous property price predictions.</p>
        </div>
        <Button variant="outline" className="border-slate-200">
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by location..." 
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
             <Button variant="outline" className="border-slate-200 py-2.5 h-full">
              <Filter className="h-4 w-4 mr-2" /> Filters
            </Button>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : filteredHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Property Details</th>
                  <th className="pb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Estimated Price</th>
                  <th className="pb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Date Predicted</th>
                  <th className="pb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Confidence</th>
                  <th className="pb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="pb-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900 shrink-0">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.location}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{item.type}</span>
                            <span className="text-xs font-medium text-slate-500">{item.bedrooms} BR</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5">
                      <span className="text-lg font-bold text-slate-900">₹{Number(item.price).toLocaleString('en-IN')}</span>
                    </td>
                    <td className="py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="h-4 w-4" />
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                          <div 
                            className={`h-full ${item.confidence > 90 ? 'bg-green-500' : 'bg-blue-500'}`} 
                            style={{ width: `${item.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-600">{item.confidence}%</span>
                      </div>
                    </td>
                    <td className="py-5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                        Complete
                      </span>
                    </td>
                    <td className="py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
                          <Eye className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
              <p className="text-sm text-slate-500">Showing <span className="font-bold text-slate-900">1 to {filteredHistory.length}</span> of <span className="font-bold text-slate-900">{filteredHistory.length}</span> results</p>
              <div className="flex gap-2">
                <Button variant="outline" className="p-2 border-slate-200" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="p-2 border-slate-200" disabled>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No predictions found</h3>
            <p className="text-slate-500 mt-1">Try adjusting your search or create a new prediction.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default History;
