import React, { useState } from 'react';
import { Task } from '../../types/pm';
import { TaskCard } from './TaskCard';

const COLUMNS = ['Todo', 'In Progress', 'Review', 'Completed', 'Blocked'] as const;

export function KanbanBoard({ 
  tasks, 
  onTaskMove,
  onTaskClick
}: { 
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: string) => void;
  onTaskClick: (task: Task) => void;
}) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId); // Required for Firefox
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggedTaskId) {
      onTaskMove(draggedTaskId, status);
      setDraggedTaskId(null);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-full items-start">
      {COLUMNS.map(column => {
        const columnTasks = tasks.filter(t => t.status === column);
        
        return (
          <div 
            key={column}
            className="flex-shrink-0 w-80 bg-[var(--muted)]/50 rounded-2xl flex flex-col max-h-full border border-[var(--border)]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column)}
          >
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between sticky top-0 bg-[var(--muted)]/50 backdrop-blur-md rounded-t-2xl z-10">
              <h3 className="font-semibold text-[var(--foreground)]">{column}</h3>
              <span className="bg-[var(--card)] text-[var(--muted-foreground)] text-xs font-bold px-2 py-1 rounded-full border border-[var(--border)]">
                {columnTasks.length}
              </span>
            </div>
            
            <div className="p-3 flex flex-col gap-3 overflow-y-auto min-h-[150px]">
              {columnTasks.map(task => (
                <TaskCard 
                  key={task._id} 
                  task={task} 
                  onClick={() => onTaskClick(task)}
                  onDragStart={handleDragStart}
                />
              ))}
              {columnTasks.length === 0 && (
                <div className="h-full flex items-center justify-center text-sm text-[var(--muted-foreground)] italic opacity-50 border-2 border-dashed border-[var(--border)] rounded-xl py-8">
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
