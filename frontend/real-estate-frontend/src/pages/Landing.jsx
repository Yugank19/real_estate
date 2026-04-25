import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, TrendingUp, ShieldCheck, MapPin, ArrowRight, Star } from 'lucide-react';
import { Button } from '../components/UI';

const Landing = () => {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Navbar */}
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 px-6 py-4 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-gold">
              <Building2 className="h-6 w-6 text-slate-950" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white font-montserrat">PRO<span className="text-accent-gold">VAL</span></span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-300 transition-colors hover:text-white">Features</a>
            <a href="#analytics" className="text-sm font-medium text-slate-300 transition-colors hover:text-white">Analytics</a>
            <a href="#about" className="text-sm font-medium text-slate-300 transition-colors hover:text-white">About</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-300 transition-colors hover:text-white">Login</Link>
            <Link to="/register">
              <Button variant="gold">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-slate-950 pt-20">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="/hero.png" 
            alt="Luxury Real Estate" 
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 text-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-accent-gold/30 bg-accent-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-gold">
              <Star className="h-3 w-3 fill-accent-gold" /> AI-Powered Valuation Engine
            </span>
            <h1 className="mt-8 heading-luxury text-5xl font-extrabold text-white sm:text-7xl">
              Precision Pricing for the <br />
              <span className="text-accent-gold">Elite Real Estate</span> Market
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-400">
              Leverage multi-factor analysis and machine learning to predict property values with institutional-grade accuracy. Trusted by top developers and investors worldwide.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/register">
                <Button variant="gold" className="px-10 py-4 text-lg">Start Prediction Now</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="border-slate-700 px-10 py-4 text-lg text-white hover:bg-slate-800">View Live Demo</Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Stats Overlay */}
        <div className="absolute bottom-0 w-full bg-white/5 border-t border-white/10 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { label: 'Predictions Made', value: '1.2M+' },
                { label: 'Market Accuracy', value: '98.4%' },
                { label: 'Cities Covered', value: '450+' },
                { label: 'Investment ROI', value: '24% Avg' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-500 uppercase tracking-widest font-semibold">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-slate-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-bold uppercase tracking-widest text-accent-gold">Why ProVal?</h2>
            <p className="mt-4 heading-luxury text-4xl text-slate-900 sm:text-5xl">Engineered for Excellence</p>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              Our engine doesn't just look at bedrooms and bathrooms. We analyze hundreds of variables to give you the most accurate valuation on the planet.
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Multi-Factor Analysis',
                description: 'We process everything from school ratings and transit scores to local economic data and architectural trends.',
                icon: TrendingUp,
              },
              {
                title: 'Geospatial Intelligence',
                description: 'Advanced mapping technology that understands micro-neighborhood dynamics and localized pricing shifts.',
                icon: MapPin,
              },
              {
                title: 'Institutional Grade Security',
                description: 'Your data is protected by the same encryption standards used by leading global financial institutions.',
                icon: ShieldCheck,
              },
            ].map((feature) => (
              <div key={feature.title} className="card-premium p-8 bg-white">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 mb-6">
                  <feature.icon className="h-6 w-6 text-primary-900" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-4 text-slate-600 leading-relaxed">{feature.description}</p>
                <a href="#" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-accent-gold transition-all hover:gap-3">
                  Learn more <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-20 px-6">
        <div className="mx-auto max-w-7xl border-t border-slate-800 pt-12">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
             <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gold">
                <Building2 className="h-5 w-5 text-slate-950" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-montserrat">PRO<span className="text-accent-gold">VAL</span></span>
            </div>
            <p className="text-sm text-slate-500">&copy; 2024 ProVal Engine. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
