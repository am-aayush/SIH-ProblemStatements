import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { meetingApi } from '../../services/meetingApi';
import { Meeting } from '../../types/meeting';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, Video, MapPin, Users, ChevronLeft, Save, Plus, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { AttendanceBadge } from '../../components/meetings/AttendanceBadge';
import toast from 'react-hot-toast';

export default function MeetingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Note editing state
  const [summary, setSummary] = useState('');
  const [decisions, setDecisions] = useState('');
  
  // Action item state
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  
  const isLeader = user?.role === 'Leader' || user?.role === 'CoLeader';

  useEffect(() => {
    if (id) {
      meetingApi.getMeetingDetails(id)
        .then(data => {
          setMeeting(data);
          if (data.notes) {
            setSummary(data.notes.summary || '');
            setDecisions(data.notes.importantDecisions || '');
          }
        })
        .catch(() => toast.error('Failed to load meeting details'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleUpdateAttendance = async (status: string) => {
    if (!meeting || !id) return;
    try {
      await meetingApi.updateAttendance(id, status);
      toast.success(`Marked as ${status}`);
      const updated = await meetingApi.getMeetingDetails(id);
      setMeeting(updated);
    } catch (err) {
      toast.error('Failed to update attendance');
    }
  };

  const handleSaveNotes = async () => {
    if (!meeting || !id) return;
    try {
      await meetingApi.updateNotes(id, { summary, importantDecisions: decisions });
      toast.success('Notes saved');
    } catch (err) {
      toast.error('Failed to save notes');
    }
  };

  const handleAddActionItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meeting || !id || !newItemTitle) return;
    try {
      await meetingApi.addActionItem(id, { title: newItemTitle, description: newItemDesc });
      toast.success('Action item added');
      setNewItemTitle('');
      setNewItemDesc('');
      const updated = await meetingApi.getMeetingDetails(id);
      setMeeting(updated);
    } catch (err) {
      toast.error('Failed to add action item');
    }
  };

  const handleConvertToTask = async (itemId: string) => {
    if (!meeting || !id) return;
    try {
      await meetingApi.convertActionItemToTask(id, itemId);
      toast.success('Action item converted to task!');
      const updated = await meetingApi.getMeetingDetails(id);
      setMeeting(updated);
    } catch (err) {
      toast.error('Failed to convert action item');
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!meeting || !id) return;
    try {
      await meetingApi.updateMeeting(id, { status: status as any });
      toast.success(`Meeting marked as ${status}`);
      setMeeting({ ...meeting, status: status as any });
    } catch (err) {
      toast.error('Failed to update meeting status');
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div></div>;
  if (!meeting) return <div className="text-center py-20">Meeting not found.</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full space-y-6">
      <button onClick={() => navigate('/meetings')} className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
        <ChevronLeft size={16} /> Back to Meetings
      </button>

      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusColor(meeting.status)}`}>
                {meeting.status}
              </span>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">{meeting.title}</h1>
            </div>
            <p className="text-[var(--muted-foreground)] text-sm">{meeting.description || 'No description provided.'}</p>
          </div>
          
          {isLeader && (
            <div className="flex gap-2">
              {meeting.status !== 'Completed' && (
                <button onClick={() => handleUpdateStatus('Completed')} className="px-4 py-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg text-sm font-medium transition-colors">
                  Mark Completed
                </button>
              )}
              {meeting.status === 'Scheduled' && (
                <button onClick={() => handleUpdateStatus('Cancelled')} className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors">
                  Cancel Meeting
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[var(--muted)]/50 rounded-xl mb-8 border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]"><Calendar size={18} /></div>
            <div>
              <p className="text-xs text-[var(--muted-foreground)] uppercase font-bold tracking-wider mb-0.5">Date</p>
              <p className="text-sm font-medium text-[var(--foreground)]">{format(new Date(meeting.date), 'MMM d, yyyy')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]"><Clock size={18} /></div>
            <div>
              <p className="text-xs text-[var(--muted-foreground)] uppercase font-bold tracking-wider mb-0.5">Time</p>
              <p className="text-sm font-medium text-[var(--foreground)]">{meeting.startTime} - {meeting.endTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
              {meeting.meetingType === 'Online' ? <Video size={18} /> : <MapPin size={18} />}
            </div>
            <div>
              <p className="text-xs text-[var(--muted-foreground)] uppercase font-bold tracking-wider mb-0.5">Location</p>
              <p className="text-sm font-medium text-[var(--foreground)] truncate max-w-[120px]">{meeting.meetingType === 'Online' ? 'Online' : meeting.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]"><Users size={18} /></div>
            <div>
              <p className="text-xs text-[var(--muted-foreground)] uppercase font-bold tracking-wider mb-0.5">Organizer</p>
              <p className="text-sm font-medium text-[var(--foreground)]">{typeof meeting.createdBy === 'object' ? meeting.createdBy.fullName : 'Team Leader'}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Notes Section (Visible when completed, or editable by leader) */}
            {meeting.status === 'Completed' || isLeader ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[var(--foreground)]">Meeting Notes</h3>
                  {isLeader && (
                    <button onClick={handleSaveNotes} className="flex items-center gap-2 text-sm text-[var(--primary)] hover:underline font-medium">
                      <Save size={16} /> Save Notes
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Summary</label>
                    <textarea 
                      value={summary} onChange={e => setSummary(e.target.value)}
                      disabled={!isLeader}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none resize-none min-h-[100px] disabled:opacity-70"
                      placeholder="Meeting summary..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Important Decisions</label>
                    <textarea 
                      value={decisions} onChange={e => setDecisions(e.target.value)}
                      disabled={!isLeader}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none resize-none min-h-[100px] disabled:opacity-70"
                      placeholder="Key decisions made..."
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {/* Action Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[var(--foreground)]">Action Items</h3>
              
              <div className="space-y-3">
                {meeting.actionItems.map(item => (
                  <div key={item._id} className="bg-[var(--muted)]/50 rounded-xl p-4 border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-sm text-[var(--foreground)]">{item.title}</h4>
                      {item.description && <p className="text-xs text-[var(--muted-foreground)] mt-1">{item.description}</p>}
                    </div>
                    {item.status === 'Pending' ? (
                      isLeader && (
                        <button 
                          onClick={() => handleConvertToTask(item._id!)}
                          className="flex items-center gap-2 text-xs font-bold bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                        >
                          Convert to Task <ArrowRight size={14} />
                        </button>
                      )
                    ) : (
                      <span className="text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                        Converted to Task
                      </span>
                    )}
                  </div>
                ))}
                
                {isLeader && (
                  <form onSubmit={handleAddActionItem} className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] shadow-sm">
                    <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2"><Plus size={16} className="text-[var(--primary)]" /> Add Action Item</h4>
                    <div className="space-y-3">
                      <input 
                        value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)} required
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm outline-none focus:border-[var(--primary)]"
                        placeholder="Action Item Title"
                      />
                      <input 
                        value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm outline-none focus:border-[var(--primary)]"
                        placeholder="Description (optional)"
                      />
                      <button type="submit" className="text-sm font-medium text-white bg-[var(--primary)] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                        Add Item
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* My Attendance */}
            {meeting.status === 'Scheduled' && (
              <div className="bg-[var(--muted)]/30 rounded-xl p-5 border border-[var(--border)] text-center">
                <h4 className="text-sm font-bold text-[var(--foreground)] mb-3">RSVP</h4>
                <div className="flex justify-center gap-2">
                  <button onClick={() => handleUpdateAttendance('Present')} className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 text-xs font-bold transition-colors border border-green-500/20">Present</button>
                  <button onClick={() => handleUpdateAttendance('Maybe')} className="px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 text-xs font-bold transition-colors border border-yellow-500/20">Maybe</button>
                  <button onClick={() => handleUpdateAttendance('Absent')} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-bold transition-colors border border-red-500/20">Absent</button>
                </div>
              </div>
            )}

            {/* Participants */}
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Participants ({meeting.attendees.length})</h3>
              <div className="space-y-3">
                {meeting.attendees.map(a => {
                  const u = typeof a.userId === 'object' ? a.userId : null;
                  if (!u) return null;
                  return (
                    <div key={u._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--muted)]/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.fullName} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                            {u.fullName?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-[var(--foreground)]">{u.fullName}</p>
                          <p className="text-[10px] text-[var(--muted-foreground)] uppercase">{u.role}</p>
                        </div>
                      </div>
                      <AttendanceBadge status={a.status} />
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Meeting Link Button */}
            {meeting.meetingLink && (
              <a href={meeting.meetingLink} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl font-medium transition-colors">
                <Video size={18} /> Join Meeting
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
