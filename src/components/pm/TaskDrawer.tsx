import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Task, TaskSchema } from '../../types/pm';
import { X, Save, Trash2, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../context/AuthContext';

interface TaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: (taskData: Partial<Task>) => void;
  onDelete?: (taskId: string) => void;
  teamMembers: User[];
}

export function TaskDrawer({ isOpen, onClose, task, onSave, onDelete, teamMembers }: TaskDrawerProps) {
  const { user } = useAuth();
  const isLeader = user?.role === 'Leader' || user?.role === 'CoLeader';
  const isAssignee = task && typeof task.assignedTo === 'object' ? task.assignedTo._id === user?._id : task?.assignedTo === user?._id;
  
  // If creating new task, only leader/coleader can edit.
  // If editing existing task, leader can edit all, assignee can only edit status/progress
  const canEditAll = isLeader;
  const canEditProgress = isLeader || isAssignee;

  const { register, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm<Task>({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'Medium',
      status: 'Todo',
      estimatedHours: 0,
      actualHours: 0,
      completionPercentage: 0,
      deadline: ''
    }
  });

  useEffect(() => {
    if (task) {
      reset({
        ...task,
        deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
        assignedTo: typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo,
      });
    } else {
      reset({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Todo',
        estimatedHours: 0,
        actualHours: 0,
        completionPercentage: 0,
        deadline: '',
        assignedTo: ''
      });
    }
  }, [task, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = (data: Task) => {
    // Clean up empty strings for optional fields
    const payload = { ...data };
    if (!payload.assignedTo) delete payload.assignedTo;
    if (!payload.deadline) delete payload.deadline;
    if (!payload.problemStatementId) delete payload.problemStatementId;
    
    onSave(payload);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[var(--card)] border-l border-[var(--border)] z-50 flex flex-col shadow-2xl animate-in slide-in-from-right">
        <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--muted)]/30">
          <h2 className="text-lg font-bold text-[var(--foreground)]">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--border)] text-[var(--muted-foreground)] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Title</label>
              <input 
                {...register('title')} 
                disabled={!canEditAll}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none disabled:opacity-60"
                placeholder="Task title"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Description</label>
              <textarea 
                {...register('description')} 
                disabled={!canEditAll}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none disabled:opacity-60 resize-none"
                placeholder="Add more details..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Status</label>
                <select 
                  {...register('status')}
                  disabled={!canEditProgress}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none disabled:opacity-60"
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Priority</label>
                <select 
                  {...register('priority')}
                  disabled={!canEditAll}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none disabled:opacity-60"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Assignee</label>
                <select 
                  {...register('assignedTo')}
                  disabled={!canEditAll}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none disabled:opacity-60"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map(m => (
                    <option key={m._id} value={m._id}>{m.fullName}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Deadline</label>
                <input 
                  type="date"
                  {...register('deadline')}
                  disabled={!canEditAll}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none disabled:opacity-60"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">Progress Tracking</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Estimated Hours</label>
                  <input 
                    type="number" min="0" step="0.5"
                    {...register('estimatedHours', { valueAsNumber: true })}
                    disabled={!canEditAll}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none disabled:opacity-60"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Actual Hours</label>
                  <input 
                    type="number" min="0" step="0.5"
                    {...register('actualHours', { valueAsNumber: true })}
                    disabled={!canEditProgress}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-[var(--foreground)]">Completion</label>
                  <span className="text-xs font-bold text-[var(--primary)]">{watch('completionPercentage')}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="5"
                  {...register('completionPercentage', { valueAsNumber: true })}
                  disabled={!canEditProgress}
                  className="w-full accent-[var(--primary)] disabled:opacity-60"
                />
              </div>
            </div>
            
            {/* Research linking placeholder */}
            <div className="pt-4 border-t border-[var(--border)]">
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Link to Problem Statement</label>
              <div className="relative">
                <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input 
                  type="number"
                  {...register('problemStatementId', { valueAsNumber: true })}
                  disabled={!canEditAll}
                  placeholder="e.g. 1654"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none disabled:opacity-60"
                />
              </div>
            </div>

          </form>
        </div>

        <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--card)] flex justify-between gap-3">
          {task && isLeader && onDelete && (
            <button 
              onClick={() => onDelete(task._id!)}
              className="px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Trash2 size={16} /> Delete
            </button>
          )}
          
          <div className="flex gap-3 ml-auto">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              form="task-form"
              type="submit"
              disabled={!canEditProgress && !canEditAll}
              className="px-6 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90 rounded-lg flex items-center gap-2 transition-opacity disabled:opacity-50"
            >
              <Save size={16} /> Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
