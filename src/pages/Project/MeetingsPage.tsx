import React, { useState, useEffect } from 'react';
import { useMeetings } from '../../hooks/useMeetings';
import { MeetingCard } from '../../components/meetings/MeetingCard';
import { Plus, X } from 'lucide-react';
import { useAuth, User } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MeetingSchema, Meeting } from '../../types/meeting';
import api from '../../services/api';

export default function MeetingsPage() {
  const { meetings, loading, addMeeting } = useMeetings();
  const { user } = useAuth();
  const isLeader = user?.role === 'Leader' || user?.role === 'CoLeader';
  
  const [filter, setFilter] = useState<'Upcoming' | 'Past'>('Upcoming');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);

  useEffect(() => {
    if (user?.teamId) {
      api.get(`/teams/${user.teamId}`).then(res => {
        setTeamMembers(res.data.members || []);
      });
    }
  }, [user]);

  const now = new Date();
  
  const filteredMeetings = meetings.filter(m => {
    const meetingDate = new Date(`${m.date.split('T')[0]}T${m.startTime}`);
    if (filter === 'Upcoming') {
      return m.status === 'Scheduled' && meetingDate >= now;
    }
    return m.status === 'Completed' || m.status === 'Cancelled' || meetingDate < now;
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Meeting>({
    resolver: zodResolver(MeetingSchema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      meetingType: 'Online',
      location: '',
      meetingLink: '',
      agenda: [],
      attendees: []
    }
  });

  const onSubmit = async (data: Meeting) => {
    await addMeeting(data);
    setIsDrawerOpen(false);
    reset();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Meetings</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">Manage team syncs and discussions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[var(--muted)] p-1 rounded-xl">
            <button 
              onClick={() => setFilter('Upcoming')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'Upcoming' ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
            >
              Upcoming
            </button>
            <button 
              onClick={() => setFilter('Past')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'Past' ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
            >
              Past
            </button>
          </div>
          
          {isLeader && (
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus size={16} /> New Meeting
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeetings.map(meeting => (
            <MeetingCard key={meeting._id} meeting={meeting} />
          ))}
          {filteredMeetings.length === 0 && (
            <div className="col-span-full bg-[var(--card)] rounded-2xl border border-[var(--border)] p-12 text-center text-[var(--muted-foreground)]">
              No meetings found.
            </div>
          )}
        </div>
      )}

      {/* Create Meeting Drawer */}
      {isDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[var(--card)] border-l border-[var(--border)] z-50 flex flex-col shadow-2xl animate-in slide-in-from-right">
            <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--muted)]/30">
              <h2 className="text-lg font-bold text-[var(--foreground)]">Schedule Meeting</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 rounded-full hover:bg-[var(--border)] text-[var(--muted-foreground)] transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="meeting-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Title</label>
                  <input 
                    {...register('title')} 
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none"
                    placeholder="Weekly Sync"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Date</label>
                  <input 
                    type="date"
                    {...register('date')} 
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none"
                  />
                  {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Start Time</label>
                    <input 
                      type="time"
                      {...register('startTime')} 
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none"
                    />
                    {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1">End Time</label>
                    <input 
                      type="time"
                      {...register('endTime')} 
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none"
                    />
                    {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Meeting Link</label>
                  <input 
                    type="url"
                    {...register('meetingLink')} 
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none"
                    placeholder="https://meet.google.com/..."
                  />
                  {errors.meetingLink && <p className="text-red-500 text-xs mt-1">{errors.meetingLink.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Invite Participants</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {teamMembers.map(member => (
                      <label key={member._id} className="flex items-center gap-3 p-2 hover:bg-[var(--muted)] rounded-lg cursor-pointer transition-colors border border-transparent hover:border-[var(--border)]">
                        <input 
                          type="checkbox" 
                          value={member._id}
                          {...register('attendees')}
                          className="w-4 h-4 text-[var(--primary)] rounded border-[var(--border)] focus:ring-[var(--primary)]"
                        />
                        <div className="flex items-center gap-2">
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.fullName} className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-[10px] font-bold">
                              {member.fullName.charAt(0)}
                            </div>
                          )}
                          <span className="text-sm font-medium text-[var(--foreground)]">{member.fullName}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--card)] flex justify-end gap-3">
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                form="meeting-form"
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90 rounded-lg flex items-center gap-2 transition-opacity"
              >
                Schedule
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
