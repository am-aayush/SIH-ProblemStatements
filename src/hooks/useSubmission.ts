import { useState, useEffect, useCallback } from 'react';
import { SubmissionTrackerData } from '../types/submission';
import { submissionApi } from '../services/submissionApi';
import toast from 'react-hot-toast';

export function useSubmission() {
  const [tracker, setTracker] = useState<SubmissionTrackerData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTracker = useCallback(async () => {
    try {
      setLoading(true);
      const data = await submissionApi.getTracker();
      setTracker(data);
    } catch (err) {
      toast.error('Failed to load submission tracker');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTracker();
  }, [fetchTracker]);

  const updateMilestone = async (milestoneId: string, data: any) => {
    try {
      const updated = await submissionApi.updateMilestone(milestoneId, data);
      setTracker(updated);
      toast.success('Milestone updated');
      return updated;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update milestone');
      throw err;
    }
  };

  const assignMembers = async (milestoneId: string, members: string[]) => {
    try {
      const updated = await submissionApi.assignMilestoneMembers(milestoneId, members);
      setTracker(updated);
      toast.success('Members assigned');
      return updated;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign members');
      throw err;
    }
  };

  return { tracker, loading, updateMilestone, assignMembers, refreshTracker: fetchTracker };
}
