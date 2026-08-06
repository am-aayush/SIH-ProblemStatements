import React, { useEffect, useState } from 'react';
import { Users, Link as LinkIcon, UserMinus, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth, User } from '../../context/AuthContext';

interface TeamData {
  _id: string;
  teamName: string;
  uniqueTeamCode: string;
  leader: User;
  coLeader: User | null;
  members: User[];
  createdAt: string;
}

export default function TeamManagement() {
  const { user } = useAuth();
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/teams/${user.teamId}`);
      setTeam(res.data);
    } catch (err) {
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const generateInvite = async () => {
    try {
      const res = await api.post('/teams/invite');
      setInviteCode(res.data.inviteCode);
      toast.success('Invite code generated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate invite');
    }
  };

  const copyInvite = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      toast.success('Copied to clipboard!');
    }
  };

  const manageMember = async (memberId: string, action: 'promote' | 'demote' | 'remove') => {
    try {
      if (!team) return;
      await api.put(`/teams/${team._id}/members/${memberId}`, { action });
      toast.success(`Member successfully ${action}d`);
      fetchTeam();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Failed to ${action} member`);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-[var(--primary)]" /></div>;
  if (!team) return <div className="text-center py-20 text-[var(--muted-foreground)]">Team not found</div>;

  const isLeader = user?.role === 'Leader';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{team.teamName}</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Manage your team members and roles</p>
        </div>
        {isLeader && (
          <div className="flex gap-2">
            {inviteCode ? (
              <button onClick={copyInvite} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl font-medium text-sm border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                <LinkIcon size={16} /> Code: {inviteCode}
              </button>
            ) : (
              <button onClick={generateInvite} className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity">
                <Users size={16} /> Generate Invite
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.members.map(member => (
          <div key={member._id} className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-3">
              <span className="text-white text-2xl font-bold">{member.fullName.charAt(0)}</span>
            </div>
            <h3 className="font-semibold text-[var(--foreground)]">{member.fullName}</h3>
            <p className="text-xs text-[var(--muted-foreground)] mb-1">{member.email}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              member.role === 'Leader' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
              member.role === 'CoLeader' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
              'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}>
              {member.role}
            </span>

            <div className="mt-4 pt-4 border-t border-[var(--border)] w-full text-left space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Primary Skills</p>
                <div className="flex flex-wrap gap-1">
                  {member.primarySkills?.length ? member.primarySkills.slice(0,3).map((skill, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--muted)] text-[var(--foreground)]">{skill}</span>
                  )) : <span className="text-xs text-[var(--muted-foreground)]">None listed</span>}
                  {member.primarySkills && member.primarySkills.length > 3 && <span className="text-[10px] text-[var(--muted-foreground)]">+{member.primarySkills.length - 3}</span>}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Experience</p>
                <span className="text-xs font-medium text-[var(--foreground)]">{member.experienceLevel || 'Beginner'}</span>
              </div>
            </div>
            
            {isLeader && member.role !== 'Leader' && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--border)] w-full justify-center">
                {member.role === 'Member' ? (
                  <button onClick={() => manageMember(member._id, 'promote')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Promote to Co-Leader">
                    <ShieldCheck size={16} />
                  </button>
                ) : (
                  <button onClick={() => manageMember(member._id, 'demote')} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Demote to Member">
                    <ShieldAlert size={16} />
                  </button>
                )}
                <button onClick={() => manageMember(member._id, 'remove')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remove from Team">
                  <UserMinus size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
