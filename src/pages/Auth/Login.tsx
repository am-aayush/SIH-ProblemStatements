import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/login', data);
      login(res.data.token, res.data.refreshToken, res.data.user);
      toast.success('Successfully logged in!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--card)] rounded-3xl border border-[var(--border)] shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-4">
            <span className="text-white text-xl font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Welcome back</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">Log in to manage your team and problems</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
              <input {...register('email')} type="email" placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
              <input {...register('password')} type="password" placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all" />
            </div>
            <div className="flex justify-between items-center mt-1">
              {errors.password ? (
                <p className="text-red-500 text-xs">{errors.password.message}</p>
              ) : (
                <span />
              )}
              <Link to="/reset-password" className="text-xs text-[var(--primary)] hover:underline font-medium">Forgot Password?</Link>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-70">
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Log In'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
          <p>Don't have a team yet? <Link to="/signup" className="text-[var(--primary)] font-medium hover:underline">Register as Leader</Link></p>
          <p className="mt-2">Have an invite code? <Link to="/join" className="text-[var(--primary)] font-medium hover:underline">Join a Team</Link></p>
        </div>
      </div>
    </div>
  );
}
