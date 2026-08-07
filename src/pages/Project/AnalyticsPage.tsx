import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Users, CheckSquare, Calendar, Target, Lightbulb } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface AnalyticsData {
  overview: {
    totalMembers: number;
    tasksCompleted: number;
    tasksPending: number;
    meetingsCompleted: number;
    submissionProgress: number;
    researchProgress: number;
  };
  memberContributions: { name: string; tasksCompleted: number }[];
  ideaAnalytics: { totalResearched: number; shortlisted: number };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get<AnalyticsData>('/analytics');
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-[var(--muted-foreground)]">Loading analytics...</div>;
  }

  if (!data) {
    return <div className="text-center py-12 text-[var(--muted-foreground)]">No data available</div>;
  }

  const { overview, memberContributions, ideaAnalytics } = data;

  const taskDistribution = [
    { name: 'Completed', value: overview.tasksCompleted },
    { name: 'Pending', value: overview.tasksPending }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="text-[var(--primary)]" size={28} />
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Team Analytics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-2 text-[var(--muted-foreground)]">
            <Users size={18} /> <span className="text-sm font-bold uppercase tracking-wider">Members</span>
          </div>
          <div className="text-3xl font-black text-[var(--foreground)]">{overview.totalMembers}</div>
        </div>
        <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-2 text-[var(--muted-foreground)]">
            <CheckSquare size={18} /> <span className="text-sm font-bold uppercase tracking-wider">Tasks Done</span>
          </div>
          <div className="text-3xl font-black text-emerald-500">{overview.tasksCompleted}</div>
        </div>
        <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-2 text-[var(--muted-foreground)]">
            <Calendar size={18} /> <span className="text-sm font-bold uppercase tracking-wider">Meetings</span>
          </div>
          <div className="text-3xl font-black text-blue-500">{overview.meetingsCompleted}</div>
        </div>
        <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-2 text-[var(--muted-foreground)]">
            <Target size={18} /> <span className="text-sm font-bold uppercase tracking-wider">Progress</span>
          </div>
          <div className="text-3xl font-black text-purple-500">{overview.submissionProgress}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] flex flex-col h-[400px]">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-6">Member Contribution (Tasks)</h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberContributions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }} />
                <Bar dataKey="tasksCompleted" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] flex flex-col h-[400px]">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-6">Task Distribution</h2>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            {overview.tasksCompleted === 0 && overview.tasksPending === 0 ? (
              <div className="text-[var(--muted-foreground)]">No tasks created yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={taskDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {taskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'Completed' ? '#10b981' : '#f59e0b'} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-sm font-medium text-[var(--foreground)]">Completed ({overview.tasksCompleted})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-sm font-medium text-[var(--foreground)]">Pending ({overview.tasksPending})</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)]">
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
          <Lightbulb className="text-amber-500" size={20} /> Research Pipeline
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="p-4 bg-[var(--muted)]/50 rounded-xl border border-[var(--border)]">
              <div className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Researched</div>
              <div className="text-2xl font-black text-[var(--foreground)]">{ideaAnalytics.totalResearched}</div>
           </div>
           <div className="p-4 bg-[var(--muted)]/50 rounded-xl border border-[var(--border)]">
              <div className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Shortlisted</div>
              <div className="text-2xl font-black text-[var(--foreground)]">{ideaAnalytics.shortlisted}</div>
           </div>
        </div>
      </div>

    </div>
  );
}
