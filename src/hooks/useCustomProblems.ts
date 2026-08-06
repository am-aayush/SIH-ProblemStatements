import { useState, useEffect } from 'react';
import api from '../services/api';

export interface CustomProblem {
  _id: string;
  title: string;
  description: string;
  solution?: string;
  status: string;
  createdBy: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  teamId: string;
  votes: {
    _id: string;
    userId: { _id: string; fullName: string; avatar?: string };
    vote: number;
  }[];
  comments: {
    _id: string;
    userId: { _id: string; fullName: string; avatar?: string };
    message: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export function useCustomProblems() {
  const [problems, setProblems] = useState<CustomProblem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/custom-problems');
      setProblems(data);
    } catch (error) {
      console.error('Failed to fetch custom problems:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const addProblem = async (problemData: Partial<CustomProblem>) => {
    try {
      const { data } = await api.post('/custom-problems', problemData);
      setProblems(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Failed to add custom problem:', error);
      throw error;
    }
  };

  const updateProblem = async (id: string, problemData: Partial<CustomProblem>) => {
    try {
      const { data } = await api.put(`/custom-problems/${id}`, problemData);
      setProblems(prev => prev.map(p => p._id === id ? data : p));
      return data;
    } catch (error) {
      console.error('Failed to update custom problem:', error);
      throw error;
    }
  };

  const deleteProblem = async (id: string) => {
    try {
      await api.delete(`/custom-problems/${id}`);
      setProblems(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error('Failed to delete custom problem:', error);
      throw error;
    }
  };

  const voteProblem = async (id: string, vote: number) => {
    try {
      const { data } = await api.put(`/custom-problems/${id}/vote`, { vote });
      setProblems(prev => prev.map(p => p._id === id ? data : p));
      return data;
    } catch (error) {
      console.error('Failed to vote on custom problem:', error);
      throw error;
    }
  };

  const addComment = async (id: string, message: string) => {
    try {
      const { data } = await api.post(`/custom-problems/${id}/comments`, { message });
      setProblems(prev => prev.map(p => p._id === id ? data : p));
      return data;
    } catch (error) {
      console.error('Failed to add comment to custom problem:', error);
      throw error;
    }
  };

  return {
    problems,
    loading,
    addProblem,
    updateProblem,
    deleteProblem,
    voteProblem,
    addComment,
    refreshProblems: fetchProblems
  };
}
