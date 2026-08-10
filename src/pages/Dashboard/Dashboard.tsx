import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Lightbulb, ListTodo, CheckCircle2, Clock, Activity, TrendingUp, Shield, Hash, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useTasks } from '../../hooks/useTasks';
import { DeadlineWidget } from '../../components/dashboard/DeadlineWidget';

export default function Dashboard() {
  const { user } = useAuth();
  const [memberCount, setMemberCount] = useState(0);
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  
  const [analytics, setAnalytics] = useState({ ideas: 0, meetings: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  
  const { tasks } = useTasks();
  
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  useEffect(() => {
    if (user) {
      api.get(`/teams/${user.teamId}`).then(res => {
        setMemberCount(res.data.members?.length || 0);
        setTeamName(res.data.teamName);
        setTeamCode(res.data.uniqueTeamCode);
      }).catch(err => {
        console.error("Failed to load team data");
      });

      api.get('/analytics').then(res => {
        setAnalytics({
          ideas: res.data.ideaAnalytics?.totalResearched || 0,
          meetings: res.data.overview?.meetingsCompleted || 0
        });
      }).catch(console.error);

      api.get('/notifications').then(res => {
        setActivities(res.data.slice(0, 5));
      }).catch(console.error);
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-linear-to-br from-(--primary) to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden shrink-0 bg-white/10 flex items-center justify-center shadow-inner">
            {user.avatar ? (
              <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold">{user.fullName.charAt(0)}</span>
            )}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.fullName}!</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-medium text-white/90">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm shadow-sm">
                <Shield size={14} /> {user.role}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm shadow-sm">
                <Users size={14} /> {teamName || 'Loading Team...'}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm shadow-sm font-mono">
                <Hash size={14} /> {teamCode || '...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Statistics (Placeholders) */}
      <div>
        <h2 className="text-lg font-bold text-(--foreground) mb-4">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link to="/team" className="block bg-(--card) p-5 rounded-2xl border border-(--border) shadow-sm hover:shadow-md hover:border-[var(--primary)] transition-all">
            <Users className="text-blue-500 mb-3" size={24} />
            <p className="text-2xl font-bold text-[var(--foreground)]">{memberCount}</p>
            <p className="text-xs text-[var(--muted-foreground)] font-medium uppercase tracking-wider mt-1">Members</p>
          </Link>
          <Link to="/ideas" className="block bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-md hover:border-[var(--primary)] transition-all">
            <Lightbulb className="text-yellow-500 mb-3" size={24} />
            <p className="text-2xl font-bold text-[var(--foreground)]">{analytics.ideas}</p>
            <p className="text-xs text-[var(--muted-foreground)] font-medium uppercase tracking-wider mt-1">Ideas</p>
          </Link>
          <div className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
            <ListTodo className="text-indigo-500 mb-3" size={24} />
            <p className="text-2xl font-bold text-[var(--foreground)]">{totalTasks}</p>
            <p className="text-xs text-[var(--muted-foreground)] font-medium uppercase tracking-wider mt-1">Tasks</p>
          </div>
          <div className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
            <CheckCircle2 className="text-green-500 mb-3" size={24} />
            <p className="text-2xl font-bold text-[var(--foreground)]">{completedTasks}</p>
            <p className="text-xs text-[var(--muted-foreground)] font-medium uppercase tracking-wider mt-1">Done</p>
          </div>
          <div className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
            <Clock className="text-orange-500 mb-3" size={24} />
            <p className="text-2xl font-bold text-[var(--foreground)]">{analytics.meetings}</p>
            <p className="text-xs text-[var(--muted-foreground)] font-medium uppercase tracking-wider mt-1">Meetings</p>
          </div>
          <div className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
            <TrendingUp className="text-purple-500 mb-3" size={24} />
            <p className="text-2xl font-bold text-[var(--foreground)]">{progressPercent}%</p>
            <p className="text-xs text-[var(--muted-foreground)] font-medium uppercase tracking-wider mt-1">Progress</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Navigation */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/team" className="group bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] hover:border-[var(--primary)] transition-colors flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--foreground)]">Team Management</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">Manage roles & invites</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-[var(--muted-foreground)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
            </Link>
            
            <Link to="/skill-matrix" className="group bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] hover:border-[var(--primary)] transition-colors flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--foreground)]">Skill Matrix</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">Explore team capabilities</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-[var(--muted-foreground)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
            </Link>

            <Link to="/progress" className="group bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] hover:border-[var(--primary)] transition-colors flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--foreground)]">Team Progress</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">Track tasks & completion</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-[var(--muted-foreground)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
            </Link>
            
            <Link to="/problems" className="group bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] hover:border-[var(--primary)] transition-colors flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--foreground)]">Problem Explorer</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">Find SIH problem statements</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-[var(--muted-foreground)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

        {/* Activity and Deadlines */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--foreground)]">Recent Activity</h2>
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 space-y-6 shadow-sm">
              {activities.length > 0 ? activities.map(act => (
                <div key={act._id} className="flex items-start gap-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-[var(--primary)] shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{act.message}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{new Date(act.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              )) : (
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-[var(--muted-foreground)] shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)] italic opacity-70">No recent activities</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DeadlineWidget tasks={tasks} />
        </div>
      </div>
    </div>
  );
}
