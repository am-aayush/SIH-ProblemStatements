import React from 'react';
import { Task } from '../../types/pm';
import { Clock, AlertCircle, CheckCircle2, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';

export function TaskTable({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick: (task: Task) => void }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'High': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Medium': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Todo': return 'bg-gray-500/10 text-gray-500';
      case 'In Progress': return 'bg-blue-500/10 text-blue-500';
      case 'Review': return 'bg-purple-500/10 text-purple-500';
      case 'Completed': return 'bg-green-500/10 text-green-500';
      case 'Blocked': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead>
          <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
            <th className="py-3 px-4 font-medium">Title</th>
            <th className="py-3 px-4 font-medium">Status</th>
            <th className="py-3 px-4 font-medium">Priority</th>
            <th className="py-3 px-4 font-medium">Assignee</th>
            <th className="py-3 px-4 font-medium">Deadline</th>
            <th className="py-3 px-4 font-medium">Progress</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {tasks.map(task => (
            <tr 
              key={task._id} 
              onClick={() => onTaskClick(task)}
              className="hover:bg-[var(--muted)]/50 transition-colors cursor-pointer group"
            >
              <td className="py-3 px-4 max-w-xs truncate font-medium text-[var(--foreground)]">{task.title}</td>
              <td className="py-3 px-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </td>
              <td className="py-3 px-4">
                {task.assignedTo ? (
                  <div className="flex items-center gap-2">
                    {typeof task.assignedTo === 'object' && task.assignedTo.profile?.avatar ? (
                      <img src={task.assignedTo.profile.avatar} className="w-6 h-6 rounded-full object-cover" alt="assignee" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-[10px] font-bold">
                        {typeof task.assignedTo === 'object' ? task.assignedTo.fullName.charAt(0) : <UserIcon size={12}/>}
                      </div>
                    )}
                    <span className="text-[var(--foreground)] text-xs">
                      {typeof task.assignedTo === 'object' ? task.assignedTo.fullName : 'Unknown'}
                    </span>
                  </div>
                ) : (
                  <span className="text-[var(--muted-foreground)] italic text-xs">Unassigned</span>
                )}
              </td>
              <td className="py-3 px-4 text-[var(--muted-foreground)]">
                {task.deadline ? format(new Date(task.deadline), 'MMM d, yyyy') : '-'}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 w-24">
                  <div className="flex-1 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--primary)]" 
                      style={{ width: `${task.completionPercentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-[var(--muted-foreground)]">{task.completionPercentage}%</span>
                </div>
              </td>
            </tr>
          ))}
          {tasks.length === 0 && (
            <tr>
              <td colSpan={6} className="py-8 text-center text-[var(--muted-foreground)]">
                No tasks found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
