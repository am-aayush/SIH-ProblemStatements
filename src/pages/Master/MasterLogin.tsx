import React, { useState } from 'react';
import { Shield, Mail, Key, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMasterAuth } from '../../context/MasterContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function MasterLogin() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { loginMaster } = useMasterAuth();
  const navigate = useNavigate();

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    try {
      setLoading(true);
      const res = await api.post('/master/auth/request-otp', { email });
      toast.success(res.data.message || 'OTP sent successfully');
      setStep('otp');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    try {
      setLoading(true);
      const res = await api.post('/master/auth/verify-otp', { email, otp });
      loginMaster(res.data.token);
      toast.success('Authenticated as Master Admin');
      navigate('/master/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-8 relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/20 blur-[64px] rounded-full pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Master Admin</h1>
          <p className="text-sm text-slate-400 mt-2 font-medium uppercase tracking-wider">Restricted Area</p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleRequestOTP} className="space-y-5 relative z-10">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Authorized Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600" 
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading || !email}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (
                <>Request Access Code <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-5 relative z-10">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Enter OTP Code</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit code"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600 tracking-widest text-center font-mono text-lg" 
                  maxLength={6}
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading || otp.length < 6}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Enter'}
            </button>
            <button 
              type="button" 
              onClick={() => setStep('email')}
              className="w-full py-2 text-slate-400 hover:text-white text-xs font-medium transition-colors"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
