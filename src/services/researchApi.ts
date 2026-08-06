import api from './api';
import { PipelineStage, ResearchData, Comment, Vote, ProblemResearch } from '../types/research';

export const researchApi = {
  getTeamResearch: () => api.get<ResearchData>('/research').then(res => res.data),
  toggleBookmark: (problemId: number) => api.post<ProblemResearch>(`/research/${problemId}/bookmark`).then(res => res.data),
  updateStage: (problemId: number, status: PipelineStage) => api.put<ProblemResearch>(`/research/${problemId}/stage`, { status }).then(res => res.data),
  finalizeProblem: (problemId: number) => api.post<ProblemResearch>(`/research/${problemId}/finalize`).then(res => res.data),
  addComment: (problemId: number, message: string) => api.post<Comment>(`/research/${problemId}/comments`, { message }).then(res => res.data),
  updateComment: (problemId: number, commentId: string, message: string) => api.put<Comment>(`/research/${problemId}/comments/${commentId}`, { message }).then(res => res.data),
  deleteComment: (problemId: number, commentId: string) => api.delete(`/research/${problemId}/comments/${commentId}`).then(res => res.data),
  voteProblem: (problemId: number, rating: number) => api.post<Vote>(`/research/${problemId}/votes`, { rating }).then(res => res.data),
  
  // Workspace specific
  addNote: (problemId: number, content: string) => api.post<ProblemResearch>(`/research/${problemId}/notes`, { content }).then(res => res.data),
  deleteNote: (problemId: number, noteId: string) => api.delete<ProblemResearch>(`/research/${problemId}/notes/${noteId}`).then(res => res.data),
  addResource: (problemId: number, resource: Partial<any>) => api.post<ProblemResearch>(`/research/${problemId}/resources`, resource).then(res => res.data),
  deleteResource: (problemId: number, resourceId: string) => api.delete<ProblemResearch>(`/research/${problemId}/resources/${resourceId}`).then(res => res.data),
  updateTechStack: (problemId: number, techStack: any[]) => api.put<ProblemResearch>(`/research/${problemId}/techstack`, { techStack }).then(res => res.data),
};
