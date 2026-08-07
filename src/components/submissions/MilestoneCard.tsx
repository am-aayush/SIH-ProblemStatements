import React from 'react';
import { Milestone } from '../../types/submission';
import { Calendar, Users as UsersIcon, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export function MilestoneCard({ 
  milestone, 
  index,
  onClick
}: { 
  milestone: Milestone; 
  index: number;
  onClick: (m: Milestone) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'In Progress': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Blocked': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getProgressColor = (status: string) => {
    if (status === 'Completed') return 'bg-green-500';
    if (status === 'Blocked') return 'bg-red-500';
    return 'bg-[var(--primary)]';
  };

  return (
    <div 
      onClick={() => onClick(milestone)}
      className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 hover:border-[var(--primary)] transition-colors shadow-sm cursor-pointer relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--primary)] to-purple-600 opacity-50 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[var(--muted)] flex items-center justify-center text-xs font-bold text-[var(--muted-foreground)]">
            {index + 1}
          </span>
          <h3 className="font-bold text-[var(--foreground)]">{milestone.name}</h3>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusColor(milestone.status)}`}>
          {milestone.status}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-1 text-xs">
          <span className="text-[var(--muted-foreground)] font-medium">Progress</span>
          <span className="font-bold text-[var(--foreground)]">{milestone.progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(milestone.status)}`} 
            style={{ width: `${milestone.progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] border-t border-[var(--border)] pt-3 mt-auto">
        <div className="flex items-center gap-3">
          {milestone.deadline && (
            <div className="flex items-center gap-1" title="Deadline">
              <Calendar size={14} />
              <span>{format(new Date(milestone.deadline), 'MMM d')}</span>
            </div>
          )}
          {milestone.assignedMembers.length > 0 && (
            <div className="flex items-center gap-1" title="Assignees">
              <UsersIcon size={14} />
              <span>{milestone.assignedMembers.length}</span>
            </div>
          )}
          {milestone.notes && (
            <div className="flex items-center gap-1" title="Notes added">
              <MessageSquare size={14} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
