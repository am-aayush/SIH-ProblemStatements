import api from './api';
import { SubmissionTrackerData } from '../types/submission';

export const submissionApi = {
  getTracker: () => api.get<SubmissionTrackerData>('/submissions').then(res => res.data),
  
  updateMilestone: (milestoneId: string, data: any) => 
    api.put<SubmissionTrackerData>(`/submissions/milestone/${milestoneId}`, data).then(res => res.data),
    
  assignMilestoneMembers: (milestoneId: string, assignedMembers: string[]) => 
    api.put<SubmissionTrackerData>(`/submissions/milestone/${milestoneId}/assign`, { assignedMembers }).then(res => res.data)
};
