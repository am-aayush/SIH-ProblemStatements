import { useState, useEffect, useCallback } from 'react';
import { Meeting } from '../types/meeting';
import { meetingApi } from '../services/meetingApi';
import toast from 'react-hot-toast';

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await meetingApi.getMeetings();
      setMeetings(data);
    } catch (err) {
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const addMeeting = async (data: Partial<Meeting>) => {
    try {
      const newMeeting = await meetingApi.createMeeting(data);
      setMeetings(prev => [...prev, newMeeting].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      toast.success('Meeting scheduled');
      return newMeeting;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to schedule meeting');
      throw err;
    }
  };

  const updateMeeting = async (id: string, data: Partial<Meeting>) => {
    try {
      const updated = await meetingApi.updateMeeting(id, data);
      setMeetings(prev => prev.map(m => m._id === id ? updated : m));
      toast.success('Meeting updated');
      return updated;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update meeting');
      throw err;
    }
  };

  const deleteMeeting = async (id: string) => {
    try {
      await meetingApi.deleteMeeting(id);
      setMeetings(prev => prev.filter(m => m._id !== id));
      toast.success('Meeting deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete meeting');
      throw err;
    }
  };
  
  const updateAttendance = async (id: string, status: string) => {
    try {
      const updated = await meetingApi.updateAttendance(id, status);
      setMeetings(prev => prev.map(m => m._id === id ? updated : m));
      toast.success(`Attendance marked as ${status}`);
      return updated;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update attendance');
      throw err;
    }
  }

  return { meetings, loading, addMeeting, updateMeeting, deleteMeeting, updateAttendance, refreshMeetings: fetchMeetings };
}
