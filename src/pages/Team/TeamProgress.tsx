import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, Loader2, ListTodo } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

import { useTasks } from '../../hooks/useTasks';

interface MemberData {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  avatar?: string;
}

export default function TeamProgress() {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const { tasks, loading: loadingTasks } = useTasks();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await api.get('/users/team/search');
      setMembers(res.data);
    } catch (error) {
      toast.error('Failed to load team progress');
    } finally {
      setLoadingMembers(false);
    }
  };

  if (loadingMembers || loadingTasks) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-[var(--primary)]" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Team Progress</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Track weekly tasks and overall completion for each member</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {members.map(member => {
          // Calculate actual task progress for this member
          const memberTasks = tasks.filter(t => (t.assignedTo as any)?._id === member._id || t.assignedTo === member._id);
          const completedTasks = memberTasks.filter(t => t.status === 'Completed').length;
          const pendingTasks = memberTasks.length - completedTasks;
          const totalTasks = memberTasks.length;
          const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          
          // Get recent tasks (up to 2)
          const recentTasks = [...memberTasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 2);

          return (
            <div key={member._id} className="bg-[var(--card)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-sm">
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-[var(--border)] overflow-hidden shrink-0">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-bold">{member.fullName.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)]">{member.fullName}</h3>
                    <span className="text-xs text-[var(--muted-foreground)]">{member.role}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-[var(--foreground)]">{percentage}%</p>
                  <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Overall</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-[var(--muted)]">
                <div className="h-full bg-[var(--primary)] transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-3 border border-green-100 dark:border-green-900/30">
                    <div className="flex items-center gap-2 mb-1 text-green-700 dark:text-green-400">
                      <CheckCircle2 size={16} />
                      <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
                    </div>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">{completedTasks}</p>
                  </div>
                  
                  <div className="bg-orange-50/50 dark:bg-orange-900/10 rounded-xl p-3 border border-orange-100 dark:border-orange-900/30">
                    <div className="flex items-center gap-2 mb-1 text-orange-700 dark:text-orange-400">
                      <Clock size={16} />
                      <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{pendingTasks}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
                    <ListTodo size={16} className="text-[var(--primary)]" />
                    Current Tasks
                  </h4>
                  <div className="space-y-2">
                    {recentTasks.length > 0 ? recentTasks.map(task => (
                      <div key={task._id} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)]">
                        {task.status === 'Completed' ? (
                          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-500" />
                        ) : (
                          <Circle size={16} className="mt-0.5 shrink-0 text-[var(--muted-foreground)]" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${task.status === 'Completed' ? 'text-[var(--foreground)] line-through opacity-70' : 'text-[var(--foreground)]'}`}>
                            {task.title}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                            {task.status === 'Completed' ? 'Completed' : task.deadline ? `Due ${new Date(task.deadline).toLocaleDateString()}` : 'No due date'}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-xs text-[var(--muted-foreground)] italic p-3 bg-[var(--muted)]/30 rounded-xl">No tasks assigned yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
