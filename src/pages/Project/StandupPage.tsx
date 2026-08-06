import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { pmApi } from '../../services/pmApi';
import { Standup } from '../../types/pm';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function StandupPage() {
  const { user } = useAuth();
  const [standups, setStandups] = useState<Standup[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [yesterday, setYesterday] = useState('');
  const [today, setToday] = useState('');
  const [blockers, setBlockers] = useState('');
  
  const dateStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchStandups();
  }, []);

  const fetchStandups = async () => {
    try {
      setLoading(true);
      const data = await pmApi.getStandups();
      setStandups(data);
      
      const myStandup = data.find(s => {
        const uId = typeof s.userId === 'object' ? s.userId._id : s.userId;
        return uId === user?._id;
      });
      
      if (myStandup) {
        setYesterday(myStandup.yesterday);
        setToday(myStandup.today);
        setBlockers(myStandup.blockers || '');
      }
    } catch (err) {
      toast.error('Failed to load standups');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yesterday.trim() || !today.trim()) {
      toast.error('Please fill in Yesterday and Today');
      return;
    }
    
    try {
      await pmApi.submitStandup({ yesterday, today, blockers });
      toast.success('Standup submitted!');
      fetchStandups();
    } catch (err) {
      toast.error('Failed to submit standup');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Daily Standup</h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-1">Share your progress and read team updates for {format(new Date(), 'EEEE, MMMM d')}.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 sticky top-24">
            <h3 className="font-bold text-[var(--foreground)] mb-4">My Standup</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">What did you complete yesterday?</label>
                <textarea 
                  value={yesterday} onChange={e => setYesterday(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none resize-none"
                  rows={3} placeholder="Implemented auth logic..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">What will you work on today?</label>
                <textarea 
                  value={today} onChange={e => setToday(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none resize-none"
                  rows={3} placeholder="Building the tasks page..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Any blockers?</label>
                <textarea 
                  value={blockers} onChange={e => setBlockers(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none resize-none"
                  rows={2} placeholder="Waiting on API keys..."
                />
              </div>
              <button type="submit" className="w-full bg-[var(--primary)] text-white font-medium py-2 rounded-lg hover:opacity-90 transition-opacity">
                Submit Standup
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <h3 className="font-bold text-[var(--foreground)]">Team Updates</h3>
          
          {loading ? (
            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div></div>
          ) : standups.length === 0 ? (
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-8 text-center text-[var(--muted-foreground)] text-sm">
              No one has submitted a standup today. Be the first!
            </div>
          ) : (
            standups.map(standup => (
              <div key={standup._id} className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5">
                <div className="flex items-center gap-3 mb-4">
                  {typeof standup.userId === 'object' && standup.userId.profile?.avatar ? (
                    <img src={standup.userId.profile.avatar} className="w-10 h-10 rounded-full object-cover" alt="avatar" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {typeof standup.userId === 'object' ? standup.userId.fullName.charAt(0) : '?'}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-[var(--foreground)]">
                      {typeof standup.userId === 'object' ? standup.userId.fullName : 'Unknown Member'}
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {typeof standup.userId === 'object' ? standup.userId.role : ''}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 pl-13">
                  <div>
                    <div className="text-xs font-bold text-[var(--muted-foreground)] uppercase flex items-center gap-1.5 mb-1"><CheckCircle2 size={14} className="text-green-500"/> Yesterday</div>
                    <p className="text-sm text-[var(--foreground)]">{standup.yesterday}</p>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--muted-foreground)] uppercase flex items-center gap-1.5 mb-1"><CheckCircle2 size={14} className="text-blue-500"/> Today</div>
                    <p className="text-sm text-[var(--foreground)]">{standup.today}</p>
                  </div>
                  {standup.blockers && (
                    <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-xl mt-2">
                      <div className="text-xs font-bold text-red-500 uppercase flex items-center gap-1.5 mb-1"><AlertCircle size={14}/> Blockers</div>
                      <p className="text-sm text-[var(--foreground)]">{standup.blockers}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
