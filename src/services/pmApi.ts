import api from './api';
import { Task, Standup, Notification } from '../types/pm';

export const pmApi = {
  // Tasks
  getTasks: () => api.get<Task[]>('/tasks').then(res => res.data),
  createTask: (data: Partial<Task>) => api.post<Task>('/tasks', data).then(res => res.data),
  updateTask: (id: string, data: Partial<Task>) => api.put<Task>(`/tasks/${id}`, data).then(res => res.data),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`).then(res => res.data),
  
  // Standups
  getStandups: (date?: string) => api.get<Standup[]>('/standups', { params: { date } }).then(res => res.data),
  submitStandup: (data: { yesterday: string; today: string; blockers?: string }) => api.post<Standup>('/standups', data).then(res => res.data),
  
  // Notifications
  getNotifications: () => api.get<Notification[]>('/notifications').then(res => res.data),
  markNotificationRead: (id: string) => api.put<Notification>(`/notifications/${id}/read`).then(res => res.data),
  markAllNotificationsRead: () => api.put('/notifications/read-all').then(res => res.data),
};
