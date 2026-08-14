import React, { useEffect, useState } from 'react';
import { Users, UsersRound, Shield, Lightbulb, CheckSquare, Loader2, LogOut, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMasterAuth } from '../../context/MasterContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface OverviewStats {
  totalUsers: number;
  totalTeams: number;
  totalLeaders: number;
  totalIdeas: number;
  totalTasks: number;
}

export default function MasterDashboard() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { masterToken, logoutMaster } = useMasterAuth();

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      // Must set the Authorization header manually since our standard API interceptor uses 'token', not 'masterToken'
      const res = await api.get('/master/analytics/overview', {
        headers: { Authorization: `Bearer ${masterToken}` }
      });
      setStats(res.data);
    } catch (err: any) {
      toast.error('Failed to load analytics overview');
      if (err.response?.status === 401) {
        logoutMaster();
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-emerald-500" /></div>;
  if (!stats) return <div className="text-center py-20 text-slate-500">No data available</div>;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Total Teams', value: stats.totalTeams, icon: UsersRound, color: 'from-purple-500 to-purple-600' },
    { label: 'Total Leaders', value: stats.totalLeaders, icon: Shield, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Total Ideas', value: stats.totalIdeas, icon: Lightbulb, color: 'from-amber-500 to-amber-600' },
    { label: 'Total Tasks', value: stats.totalTasks, icon: CheckSquare, color: 'from-rose-500 to-rose-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Master Admin Overview</h1>
            <p className="text-sm text-slate-400 mt-1">Read-only global platform statistics</p>
          </div>
        </div>
        <button 
          onClick={logoutMaster}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-colors text-sm font-medium"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-slate-800 border border-slate-700 rounded-3xl p-6 relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none`} />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-white mb-1">{card.value.toLocaleString()}</h3>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Platform Navigation</h2>
            <p className="text-sm text-slate-400">Explore specific entities</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/master/teams" className="flex items-center justify-between p-5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-emerald-500/50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-800 text-emerald-400 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                <UsersRound size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-white">Teams Explorer</h3>
                <p className="text-sm text-slate-400">View all teams, members, and bookmarks</p>
              </div>
            </div>
            <ArrowRight size={20} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
          </Link>
          
          {/* Add more explorers here in the future if needed (e.g. Users Explorer) */}
        </div>
      </div>
    </div>
  );
}
