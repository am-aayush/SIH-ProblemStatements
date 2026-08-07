import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Hash, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function JoinExistingTeam() {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.length !== 6) {
      toast.error('Invite code must be 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/join-existing', { inviteCode });
      login(res.data.token, res.data.refreshToken, res.data.user);
      toast.success('Successfully joined the team!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to join team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--card)] rounded-3xl border border-[var(--border)] shadow-xl p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
          <Hash className="text-red-600 dark:text-red-400" size={32} />
        </div>
        
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">No Team Found</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-8">
          Hi {user?.fullName}, it looks like you are not part of any team. 
          Please enter an invite code to join a new team and continue using the workspace.
        </p>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={20} />
              <input 
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="ABCDEF" 
                maxLength={6}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-lg font-mono uppercase tracking-widest outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all text-center" 
              />
            </div>
          </div>

          <button type="submit" disabled={loading || inviteCode.length !== 6}
            className="w-full py-3 mt-4 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-70 gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Join Team'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--border)]">
          <button 
            onClick={logout} 
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] hover:text-red-500 hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} /> Sign out instead
          </button>
        </div>
      </div>
    </div>
  );
}
