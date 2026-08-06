import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export interface TeamResource {
  _id: string;
  teamId: string;
  title: string;
  description?: string;
  url: string;
  category: 'Google Drive' | 'Documentation' | 'PPT' | 'Video' | 'Dataset' | 'Other';
  createdBy: { _id: string; fullName?: string; avatar?: string };
  createdAt: string;
}

export function useTeamResources() {
  const [resources, setResources] = useState<TeamResource[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<TeamResource[]>('/resources');
      setResources(res.data);
    } catch (err) {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const addResource = async (data: Partial<TeamResource>) => {
    try {
      const res = await api.post<TeamResource>('/resources', data);
      setResources([res.data, ...resources]);
      toast.success('Resource added');
    } catch (err) {
      toast.error('Failed to add resource');
      throw err;
    }
  };

  const updateResource = async (id: string, data: Partial<TeamResource>) => {
    try {
      const res = await api.put<TeamResource>(`/resources/${id}`, data);
      setResources(resources.map(r => r._id === id ? res.data : r));
      toast.success('Resource updated');
    } catch (err) {
      toast.error('Failed to update resource');
      throw err;
    }
  };

  const deleteResource = async (id: string) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await api.delete(`/resources/${id}`);
      setResources(resources.filter(r => r._id !== id));
      toast.success('Resource deleted');
    } catch (err) {
      toast.error('Failed to delete resource');
      throw err;
    }
  };

  return { resources, loading, addResource, updateResource, deleteResource, refetch: fetchResources };
}
