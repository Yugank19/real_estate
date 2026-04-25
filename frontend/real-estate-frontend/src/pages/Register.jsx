import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, ArrowRight } from 'lucide-react';
import { Button, Input, Card } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setIsLoading(true);
    try {
      const data = await authService.register(formData.name, formData.email, formData.password);
      login(data);
      toast.success('Account created! Welcome to ProVal.');
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 lg:px-8">
      <div className="w-full max-w-xl">
        <div className="mb-10 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950">
              <Building2 className="h-7 w-7 text-accent-gold" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-montserrat">PRO<span className="text-accent-gold">VAL</span></span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">Create your account</h2>
          <p className="mt-2 text-sm text-slate-500">Join thousands of investors using AI for real estate</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-2xl shadow-slate-200/50">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="md:col-span-2"
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="md:col-span-2"
              />
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <div className="md:col-span-2 flex items-center gap-2 py-2">
                <input type="checkbox" id="terms" required className="h-4 w-4 rounded border-slate-300 text-primary-900 focus:ring-primary-500" />
                <label htmlFor="terms" className="text-xs text-slate-500">
                  I agree to the <a href="#" className="font-bold text-slate-900 underline underline-offset-2">Terms of Service</a> and <a href="#" className="font-bold text-slate-900 underline underline-offset-2">Privacy Policy</a>
                </label>
              </div>
              <Button type="submit" variant="primary" className="md:col-span-2 py-4 text-base" isLoading={isLoading}>
                Create Account <ArrowRight className="h-5 w-5 ml-1" />
              </Button>
            </form>
          </Card>
        </motion.div>

        <p className="mt-10 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-900 hover:text-accent-gold transition-colors underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
