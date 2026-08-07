import React from 'react';
import { Task } from '../../types/pm';
import { Clock, AlertCircle, CheckCircle2, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';

export function TaskCard({ 
  task, 
  onClick, 
  onDragStart 
}: { 
  task: Task; 
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
}) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'High': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Medium': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'Completed';

  return (
    <div 
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart && onDragStart(e, task._id!)}
      onClick={onClick}
      className={`p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] transition-colors cursor-pointer shadow-sm group ${isOverdue ? 'border-red-500/30 bg-red-500/5' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        {task.status === 'Completed' && <CheckCircle2 size={16} className="text-green-500" />}
        {task.status === 'Blocked' && <AlertCircle size={16} className="text-red-500" />}
      </div>
      
      <h4 className="font-semibold text-sm text-[var(--foreground)] mb-1 line-clamp-2">{task.title}</h4>
      
      {task.deadline && (
        <div className={`flex items-center gap-1.5 text-xs mb-3 ${isOverdue ? 'text-red-500 font-medium' : 'text-[var(--muted-foreground)]'}`}>
          <Clock size={12} />
          {format(new Date(task.deadline), 'MMM d, yyyy')}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
        <div className="flex items-center gap-2">
          {task.assignedTo ? (
            <div className="flex items-center gap-1.5" title={typeof task.assignedTo === 'object' ? task.assignedTo.fullName : ''}>
              {typeof task.assignedTo === 'object' && task.assignedTo.profile?.avatar ? (
                <img src={task.assignedTo.profile.avatar} className="w-5 h-5 rounded-full object-cover" alt="assignee" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-[10px] font-bold">
                  {typeof task.assignedTo === 'object' ? task.assignedTo.fullName.charAt(0) : <UserIcon size={12}/>}
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-[var(--muted-foreground)] italic">Unassigned</span>
          )}
        </div>
        
        {task.estimatedHours > 0 && (
          <span className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-1.5 py-0.5 rounded-md">
            {task.actualHours}/{task.estimatedHours}h
          </span>
        )}
      </div>
    </div>
  );
}
