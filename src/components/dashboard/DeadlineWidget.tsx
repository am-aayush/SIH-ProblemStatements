import React from 'react';
import { Task } from '../../types/pm';
import { Clock } from 'lucide-react';
import { isToday, isTomorrow, isThisWeek, isPast } from 'date-fns';

export function DeadlineWidget({ tasks }: { tasks: Task[] }) {
  const tasksWithDeadlines = tasks.filter(t => t.deadline && t.status !== 'Completed');
  
  const today = tasksWithDeadlines.filter(t => isToday(new Date(t.deadline!)));
  const tomorrow = tasksWithDeadlines.filter(t => isTomorrow(new Date(t.deadline!)));
  const thisWeek = tasksWithDeadlines.filter(t => !isToday(new Date(t.deadline!)) && !isTomorrow(new Date(t.deadline!)) && isThisWeek(new Date(t.deadline!)));
  const overdue = tasksWithDeadlines.filter(t => isPast(new Date(t.deadline!)) && !isToday(new Date(t.deadline!)));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-500';
      case 'High': return 'text-orange-500';
      case 'Medium': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const renderTaskList = (list: Task[], title: string, color: string) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-4 last:mb-0">
        <h4 className={`text-xs font-bold uppercase mb-2 ${color}`}>{title} ({list.length})</h4>
        <div className="space-y-2">
          {list.map(t => (
            <div key={t._id} className="flex justify-between items-center bg-[var(--muted)]/50 p-2 rounded-lg">
              <span className="text-sm text-[var(--foreground)] truncate flex-1">{t.title}</span>
              <span className={`text-[10px] font-bold uppercase px-2 ${getPriorityColor(t.priority)}`}>
                {t.priority}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
          <Clock size={18} />
        </div>
        <h2 className="font-bold text-[var(--foreground)]">Deadline Tracker</h2>
      </div>

      <div className="space-y-1">
        {renderTaskList(overdue, 'Overdue', 'text-red-500')}
        {renderTaskList(today, 'Today', 'text-orange-500')}
        {renderTaskList(tomorrow, 'Tomorrow', 'text-yellow-500')}
        {renderTaskList(thisWeek, 'This Week', 'text-blue-500')}
        
        {tasksWithDeadlines.length === 0 && (
          <div className="text-center py-8 text-[var(--muted-foreground)] text-sm">
            No upcoming deadlines!
          </div>
        )}
      </div>
    </div>
  );
}
