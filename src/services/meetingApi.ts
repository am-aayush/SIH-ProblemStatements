import api from './api';
import { Meeting, ActionItem } from '../types/meeting';

export const meetingApi = {
  getMeetings: () => api.get<Meeting[]>('/meetings').then(res => res.data),
  
  getMeetingDetails: (id: string) => api.get<Meeting>(`/meetings/${id}`).then(res => res.data),
  
  createMeeting: (data: Partial<Meeting>) => api.post<Meeting>('/meetings', data).then(res => res.data),
  
  updateMeeting: (id: string, data: Partial<Meeting>) => api.put<Meeting>(`/meetings/${id}`, data).then(res => res.data),
  
  deleteMeeting: (id: string) => api.delete(`/meetings/${id}`).then(res => res.data),
  
  updateAttendance: (id: string, status: string) => api.put<Meeting>(`/meetings/${id}/attendance`, { status }).then(res => res.data),
  
  updateNotes: (id: string, notes: any) => api.put<Meeting>(`/meetings/${id}/notes`, notes).then(res => res.data),
  
  addActionItem: (id: string, actionItem: Partial<ActionItem>) => api.post<Meeting>(`/meetings/${id}/action-items`, actionItem).then(res => res.data),
  
  convertActionItemToTask: (meetingId: string, actionItemId: string) => api.post(`/meetings/${meetingId}/action-items/${actionItemId}/convert`).then(res => res.data)
};
