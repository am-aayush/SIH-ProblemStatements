import { useState, useEffect, useCallback } from 'react';
import { Task } from '../types/pm';
import { pmApi } from '../services/pmApi';
import toast from 'react-hot-toast';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await pmApi.getTasks();
      setTasks(data);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (data: Partial<Task>) => {
    try {
      const newTask = await pmApi.createTask(data);
      setTasks(prev => [...prev, newTask]);
      toast.success('Task created');
      return newTask;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create task');
      throw err;
    }
  };

  const updateTask = async (id: string, data: Partial<Task>) => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t._id === id ? { ...t, ...data } : t));
      const updated = await pmApi.updateTask(id, data);
      // Sync with server response (which has populated fields)
      setTasks(prev => prev.map(t => t._id === id ? updated : t));
      return updated;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update task');
      fetchTasks(); // Revert on failure
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      setTasks(prev => prev.filter(t => t._id !== id));
      await pmApi.deleteTask(id);
      toast.success('Task deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
      fetchTasks();
      throw err;
    }
  };

  return { tasks, loading, addTask, updateTask, deleteTask, refreshTasks: fetchTasks };
}
