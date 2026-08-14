import React, { useEffect, useState } from 'react';
import { UsersRound, Loader2, ArrowLeft, ArrowRight, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useMasterAuth } from '../../context/MasterContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface TeamItem {
  _id: string;
  teamName: string;
  uniqueTeamCode: string;
  createdAt: string;
  leaderName: string;
  leaderEmail: string;
  memberCount: number;
}

export default function MasterTeams() {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { masterToken, logoutMaster } = useMasterAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await api.get('/master/analytics/teams', {
        headers: { Authorization: `Bearer ${masterToken}` }
      });
      setTeams(res.data);
    } catch (err: any) {
      toast.error('Failed to load teams');
      if (err.response?.status === 401) {
        logoutMaster();
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <button onClick={() => navigate('/master/dashboard')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><UsersRound className="text-emerald-500" /> Teams Explorer</h1>
          <p className="text-sm text-slate-400 mt-1">Read-only list of all platform teams</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">Team Name</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Leader</th>
                <th className="px-6 py-4 text-center">Members</th>
                <th className="px-6 py-4 text-right">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {teams.map((team) => (
                <tr key={team._id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{team.teamName}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{team.uniqueTeamCode}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-emerald-500" />
                      <div>
                        <p className="text-white font-medium">{team.leaderName || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{team.leaderEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-slate-700 text-slate-300 text-xs font-medium">
                      {team.memberCount} / 6
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500">
                    {team.createdAt ? format(new Date(team.createdAt), 'MMM d, yyyy') : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/master/teams/${team._id}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-xs font-medium transition-colors">
                      View <ArrowRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
              {teams.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No teams found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
