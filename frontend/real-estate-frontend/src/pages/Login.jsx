import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, ArrowRight, Github } from 'lucide-react';
import { Button, Input, Card } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      login(data);
      toast.success('Welcome back to ProVal!');
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.error || 'Invalid email or password';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950">
              <Building2 className="h-7 w-7 text-accent-gold" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-montserrat">PRO<span className="text-accent-gold">VAL</span></span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500">Sign in to access your real estate portfolio</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-2xl shadow-slate-200/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="space-y-1">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="flex justify-end">
                  <a href="#" className="text-xs font-semibold text-primary-600 hover:text-primary-500 transition-colors">Forgot password?</a>
                </div>
              </div>
              <Button type="submit" variant="primary" className="w-full py-4 text-base" isLoading={isLoading}>
                Sign In <ArrowRight className="h-5 w-5 ml-1" />
              </Button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-slate-500">Or continue with</span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50">
                  <img src="https://www.svgrepo.com/show/355037/google.svg" className="h-5 w-5 mr-2" alt="Google" /> Google
                </Button>
                <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50">
                  <Github className="h-5 w-5 mr-2" /> GitHub
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        <p className="mt-10 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-primary-900 hover:text-accent-gold transition-colors underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
