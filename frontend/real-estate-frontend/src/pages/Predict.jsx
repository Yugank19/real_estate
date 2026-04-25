import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Waves, Wifi, Car, Trees,
  ArrowRight, TrendingUp, ShieldCheck, AlertCircle,
  MapPin, Home, Maximize2, BedDouble, Bath,
  Calendar, CheckCircle2, IndianRupee, BarChart3,
  Star, Info
} from 'lucide-react';
import { Card, Button, Input } from '../components/UI';
import Loader from '../components/Loader';
import { predictionService } from '../services/predictionService';
import toast from 'react-hot-toast';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Format number as Indian currency: ₹1,23,45,678 */
const formatINR = (num) => {
  if (!num) return '₹0';
  return '₹' + Number(num).toLocaleString('en-IN');
};

/** Convert raw number to readable label: 1.2 Cr, 45 L, etc. */
const toReadable = (num) => {
  if (num >= 1_00_00_000) return `₹${(num / 1_00_00_000).toFixed(2)} Cr`;
  if (num >= 1_00_000)    return `₹${(num / 1_00_000).toFixed(1)} L`;
  return formatINR(num);
};

const CITIES = [
  { value: 'Mumbai, MH',    label: 'Mumbai, Maharashtra' },
  { value: 'Delhi, DL',     label: 'New Delhi, Delhi' },
  { value: 'Bangalore, KA', label: 'Bangalore, Karnataka' },
  { value: 'Hyderabad, TS', label: 'Hyderabad, Telangana' },
  { value: 'Chennai, TN',   label: 'Chennai, Tamil Nadu' },
  { value: 'Pune, MH',      label: 'Pune, Maharashtra' },
  { value: 'Kolkata, WB',   label: 'Kolkata, West Bengal' },
  { value: 'Ahmedabad, GJ', label: 'Ahmedabad, Gujarat' },
];

const TYPES = ['Apartment', 'Villa', 'Condo', 'Penthouse', 'Townhouse', 'Single Family Home'];

const AMENITIES = [
  { id: 'pool',     name: 'Swimming Pool',     icon: Waves },
  { id: 'gym',      name: 'Fitness Center',    icon: TrendingUp },
  { id: 'parking',  name: 'Secure Parking',    icon: Car },
  { id: 'wifi',     name: 'High-speed WiFi',   icon: Wifi },
  { id: 'garden',   name: 'Private Garden',    icon: Trees },
  { id: 'security', name: '24/7 Security',     icon: ShieldCheck },
];

const FACTOR_COLORS = {
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  blue:  'bg-blue-500/20  text-blue-400  border-blue-500/30',
  amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  slate: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

// ── Confidence bar ────────────────────────────────────────────────────────────
const ConfidenceBar = ({ value }) => {
  const pct   = Math.min(100, Math.max(0, value));
  const color = pct >= 90 ? 'bg-green-500' : pct >= 75 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-slate-400">Confidence</span>
        <span className="text-xs font-bold text-white">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

// ── Select wrapper ────────────────────────────────────────────────────────────
const SelectField = ({ label, value, onChange, children, required }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-slate-700">{label}</label>
    <select
      value={value}
      onChange={onChange}
      required={required}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none
                 transition-all focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
    >
      {children}
    </select>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const Predict = () => {
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [errors,  setErrors]  = useState({});

  const [formData, setFormData] = useState({
    location:  '',
    type:      'Apartment',
    area:      '',
    bedrooms:  '2',
    bathrooms: '2',
    yearBuilt: '',
    amenities: [],
  });

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!formData.location)                          e.location  = 'Please select a city';
    if (!formData.area || Number(formData.area) < 100)
                                                     e.area      = 'Area must be at least 100 sq.ft';
    if (formData.yearBuilt) {
      const y = parseInt(formData.yearBuilt);
      if (y < 1900 || y > 2024)                     e.yearBuilt = 'Enter a year between 1900 and 2024';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const toggleAmenity = (id) =>
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(id)
        ? prev.amenities.filter(a => a !== id)
        : [...prev.amenities, id],
    }));

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setResult(null);

    try {
      const payload = {
        ...formData,
        area:      parseFloat(formData.area),
        bedrooms:  parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : 2015,
      };
      const data = await predictionService.predict(payload);
      setResult({ ...data, inputSummary: payload });
      toast.success('Valuation complete!');
    } catch (err) {
      const msg = err.response?.data?.error || 'Prediction failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setResult(null); setErrors({}); };

  // ── Derived result values ───────────────────────────────────────────────────
  const price      = result?.predictedPrice  ?? 0;
  const confidence = result?.confidenceScore ?? 0;
  const low        = Math.round(price * 0.93);
  const high       = Math.round(price * 1.07);
  const cityLabel  = CITIES.find(c => c.value === result?.inputSummary?.location)?.label ?? result?.location ?? '';

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Page header */}
      <div className="text-center max-w-2xl mx-auto pb-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight heading-luxury">
          Property Valuation Engine
        </h1>
        <p className="text-slate-500 mt-2 text-sm">
          Fill in the property details below and get an AI-powered market valuation
          trained on 10,000+ Indian real estate records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* ── LEFT: Input form (3 cols) ─────────────────────────────────────── */}
        <div className="lg:col-span-3">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" /> City / Location
                </label>
                <select
                  value={formData.location}
                  onChange={set('location')}
                  required
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all
                    focus:ring-4 focus:ring-primary-500/10
                    ${errors.location
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-slate-200 focus:border-primary-500 bg-white'}`}
                >
                  <option value="" disabled>Select an Indian city…</option>
                  {CITIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                {errors.location && (
                  <p className="text-xs text-red-500 font-medium">{errors.location}</p>
                )}
              </div>

              {/* Type + Area */}
              <div className="grid grid-cols-2 gap-4">
                <SelectField label="Property Type" value={formData.type} onChange={set('type')}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </SelectField>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Maximize2 className="h-4 w-4 text-slate-400" /> Area (sq. ft.)
                  </label>
                  <input
                    type="number"
                    min="100"
                    placeholder="e.g. 1500"
                    value={formData.area}
                    onChange={set('area')}
                    required
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all
                      focus:ring-4 focus:ring-primary-500/10
                      ${errors.area
                        ? 'border-red-400 focus:border-red-400'
                        : 'border-slate-200 focus:border-primary-500 bg-white'}`}
                  />
                  {errors.area && (
                    <p className="text-xs text-red-500 font-medium">{errors.area}</p>
                  )}
                </div>
              </div>

              {/* Bedrooms + Bathrooms + Year */}
              <div className="grid grid-cols-3 gap-4">
                <SelectField
                  label="Bedrooms"
                  value={formData.bedrooms}
                  onChange={set('bedrooms')}
                >
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} BHK</option>)}
                </SelectField>

                <SelectField
                  label="Bathrooms"
                  value={formData.bathrooms}
                  onChange={set('bathrooms')}
                >
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </SelectField>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" /> Year Built
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max="2024"
                    placeholder="e.g. 2015"
                    value={formData.yearBuilt}
                    onChange={set('yearBuilt')}
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all
                      focus:ring-4 focus:ring-primary-500/10
                      ${errors.yearBuilt
                        ? 'border-red-400 focus:border-red-400'
                        : 'border-slate-200 focus:border-primary-500 bg-white'}`}
                  />
                  {errors.yearBuilt && (
                    <p className="text-xs text-red-500 font-medium">{errors.yearBuilt}</p>
                  )}
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">
                  Amenities <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AMENITIES.map(({ id, name, icon: Icon }) => {
                    const active = formData.amenities.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleAmenity(id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left
                          ${active
                            ? 'border-accent-gold bg-accent-gold/5 text-slate-900 shadow-sm'
                            : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-accent-gold' : ''}`} />
                        <span className="text-xs font-semibold leading-tight">{name}</span>
                        {active && <CheckCircle2 className="h-3.5 w-3.5 ml-auto text-accent-gold shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="gold"
                className="w-full py-4 text-base font-bold"
                isLoading={loading}
              >
                <IndianRupee className="h-5 w-5" />
                Generate Valuation Report
                <ArrowRight className="h-5 w-5" />
              </Button>
            </form>
          </Card>
        </div>

        {/* ── RIGHT: Result panel (2 cols) ──────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="wait">

            {/* Loading */}
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <Loader />
                <p className="mt-4 text-slate-500 text-sm px-4">
                  Running Random Forest model on 10,000+ records…
                </p>
              </motion.div>
            )}

            {/* Result */}
            {!loading && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                {/* ── Main price card ── */}
                <div className="rounded-2xl bg-slate-900 text-white p-6 relative overflow-hidden">
                  {/* Decorative glow */}
                  <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-accent-gold/10 blur-3xl pointer-events-none" />

                  {/* Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      AI Valuation Report
                    </span>
                    <span className="bg-accent-gold text-slate-950 text-xs font-bold px-3 py-1 rounded-full">
                      LIVE
                    </span>
                  </div>

                  {/* Price */}
                  <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">
                    Estimated Market Value
                  </p>
                  <motion.h2
                    className="text-4xl font-extrabold text-accent-gold leading-tight"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  >
                    {toReadable(price)}
                  </motion.h2>
                  <p className="text-slate-500 text-xs mt-1">{formatINR(price)}</p>

                  {/* Price range */}
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                    <BarChart3 className="h-4 w-4 shrink-0" />
                    <span>
                      Range: <span className="text-white font-semibold">{toReadable(low)}</span>
                      {' – '}
                      <span className="text-white font-semibold">{toReadable(high)}</span>
                    </span>
                  </div>

                  {/* Confidence bar */}
                  <div className="mt-5">
                    <ConfidenceBar value={confidence} />
                  </div>

                  {/* Model name */}
                  <p className="mt-3 text-[10px] text-slate-600 font-mono">
                    {result.modelName}
                  </p>
                </div>

                {/* ── Property summary ── */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Property Summary
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: MapPin,    label: 'Location',  value: cityLabel },
                      { icon: Home,      label: 'Type',      value: result.inputSummary?.type },
                      { icon: Maximize2, label: 'Area',      value: `${result.inputSummary?.area?.toLocaleString('en-IN')} sq.ft` },
                      { icon: BedDouble, label: 'Bedrooms',  value: `${result.inputSummary?.bedrooms} BHK` },
                      { icon: Bath,      label: 'Bathrooms', value: result.inputSummary?.bathrooms },
                      { icon: Calendar,  label: 'Year Built',value: result.inputSummary?.yearBuilt ?? '—' },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-2">
                        <div className="mt-0.5 h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                          <Icon className="h-3.5 w-3.5 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</p>
                          <p className="text-xs font-bold text-slate-800 leading-tight">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Amenities selected */}
                  {result.inputSummary?.amenities?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Amenities</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.inputSummary.amenities.map(id => {
                          const a = AMENITIES.find(x => x.id === id);
                          return a ? (
                            <span key={id} className="text-[10px] font-bold bg-accent-gold/10 text-amber-700 px-2 py-0.5 rounded-full">
                              {a.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Key influencers ── */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Key Price Influencers
                  </p>
                  <div className="space-y-2">
                    {(result.factors || []).map(f => (
                      <div
                        key={f.name}
                        className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                      >
                        <span className="text-sm text-slate-700 font-medium">{f.name}</span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border
                          ${FACTOR_COLORS[f.color] ?? FACTOR_COLORS.slate}`}>
                          {f.impact} Impact
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Insight ── */}
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 flex gap-3">
                  <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-blue-900">Market Insight</p>
                    <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                      This valuation is based on a Random Forest model trained on 10,000+
                      Indian property records. Actual market prices may vary ±7% based on
                      floor, view, and negotiation.
                    </p>
                  </div>
                </div>

                {/* New prediction button */}
                <button
                  onClick={reset}
                  className="w-full text-sm font-semibold text-slate-500 hover:text-slate-800
                             transition-colors py-2 underline underline-offset-4"
                >
                  ← Start a new valuation
                </button>
              </motion.div>
            )}

            {/* Empty state */}
            {!loading && !result && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center px-6"
              >
                <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-5">
                  <Building2 className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No Valuation Yet</h3>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  Fill in the property details on the left and click
                  <span className="font-semibold text-slate-600"> Generate Valuation Report</span>.
                </p>
                <div className="mt-6 space-y-2 text-left w-full max-w-xs">
                  {['Select your city', 'Enter area & property type', 'Pick bedrooms & bathrooms', 'Click Generate'].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                        {i + 1}
                      </span>
                      {step}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Predict;
