import React, { useState, useEffect } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { KanbanBoard } from '../../components/pm/KanbanBoard';
import { TaskTable } from '../../components/pm/TaskTable';
import { TaskDrawer } from '../../components/pm/TaskDrawer';
import { Task } from '../../types/pm';
import { Kanban, List, Plus } from 'lucide-react';
import { useAuth, User } from '../../context/AuthContext';
import api from '../../services/api';

export default function TasksPage() {
  const { tasks, loading, addTask, updateTask, deleteTask } = useTasks();
  const { user } = useAuth();
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);

  useEffect(() => {
    if (user?.teamId) {
      api.get(`/teams/${user.teamId}`).then(res => {
        setTeamMembers(res.data.members || []);
      });
    }
  }, [user]);

  const myTasks = tasks.filter(t => {
    const assigneeId = typeof t.assignedTo === 'object' ? t.assignedTo?._id : t.assignedTo;
    return assigneeId === user?._id;
  });

  const otherTasks = tasks.filter(t => {
    const assigneeId = typeof t.assignedTo === 'object' ? t.assignedTo?._id : t.assignedTo;
    return assigneeId !== user?._id;
  });

  const handleTaskMove = (taskId: string, newStatus: string) => {
    updateTask(taskId, { status: newStatus as any });
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsDrawerOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (selectedTask) {
      await updateTask(selectedTask._id!, taskData);
    } else {
      await addTask(taskData);
    }
    setIsDrawerOpen(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
      setIsDrawerOpen(false);
    }
  };

  const isLeader = user?.role === 'Leader' || user?.role === 'CoLeader';

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Tasks</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">Manage team tasks and progress.</p>
        </div>
        <div className="flex items-center gap-3">
          {isLeader && (
            <button 
              onClick={handleCreateTask}
              className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus size={16} /> New Task
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto pr-2 pb-10 space-y-8">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
          </div>
        ) : (
          <>
            {/* Kanban Board - My Tasks Only */}
            <section>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--foreground)]">
                <Kanban size={20} className="text-[var(--primary)]" /> My Board
              </h2>
              <div className="h-[450px]">
                <KanbanBoard tasks={myTasks} onTaskMove={handleTaskMove} onTaskClick={handleTaskClick} />
              </div>
            </section>

            {/* Shorter UI Table - Team Tasks */}
            <section>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[var(--foreground)]">
                <List size={20} className="text-[var(--primary)]" /> Team Tasks
              </h2>
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                <TaskTable tasks={otherTasks} onTaskClick={handleTaskClick} />
              </div>
            </section>
          </>
        )}
      </div>

      <TaskDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        task={selectedTask} 
        onSave={handleSaveTask}
        onDelete={isLeader ? handleDeleteTask : undefined}
        teamMembers={teamMembers}
      />
    </div>
  );
}
