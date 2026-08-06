import React, { useState } from 'react';
import { useSubmission } from '../../hooks/useSubmission';
import { MilestoneCard } from '../../components/submissions/MilestoneCard';
import { TeamReadiness } from '../../components/submissions/TeamReadiness';
import { Milestone } from '../../types/submission';
import { useAuth, User } from '../../context/AuthContext';
import { X, Save } from 'lucide-react';
import api from '../../services/api';

export default function SubmissionTrackerPage() {
  const { tracker, loading, updateMilestone, assignMembers } = useSubmission();
  const { user } = useAuth();
  const isLeader = user?.role === 'Leader' || user?.role === 'CoLeader';

  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);

  // Form state
  const [status, setStatus] = useState<string>('Not Started');
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');
  const [deadline, setDeadline] = useState('');
  const [assigned, setAssigned] = useState<string[]>([]);

  React.useEffect(() => {
    if (user?.teamId) {
      api.get(`/teams/${user.teamId}`).then(res => {
        setTeamMembers(res.data.members || []);
      });
    }
  }, [user]);

  const handleOpenModal = (m: Milestone) => {
    setSelectedMilestone(m);
    setStatus(m.status);
    setProgress(m.progress);
    setNotes(m.notes || '');
    setDeadline(m.deadline ? new Date(m.deadline).toISOString().split('T')[0] : '');
    setAssigned(m.assignedMembers.map(u => typeof u === 'object' ? u._id : u));
  };

  const handleSave = async () => {
    if (!selectedMilestone) return;
    
    // Check if member is assigned or is leader
    const isAssigned = assigned.includes(user?._id || '');
    const canUpdate = isLeader || isAssigned;

    if (canUpdate) {
      await updateMilestone(selectedMilestone._id!, { status, progress, notes, deadline });
    }
    
    if (isLeader) {
      await assignMembers(selectedMilestone._id!, assigned);
    }
    
    setSelectedMilestone(null);
  };

  const toggleAssignee = (id: string) => {
    if (!isLeader) return;
    setAssigned(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div></div>;
  if (!tracker) return <div className="text-center py-20">Failed to load tracker.</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">SIH Submission Tracker</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">Track your progress across the complete hackathon lifecycle.</p>
        </div>
        
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-5 py-3 flex items-center gap-4">
          <span className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider">Overall Progress</span>
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${tracker.overallProgress}%` }} />
            </div>
            <span className="font-bold text-[var(--primary)] text-lg">{tracker.overallProgress}%</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tracker.milestones.map((milestone, idx) => (
              <MilestoneCard 
                key={milestone._id} 
                milestone={milestone} 
                index={idx}
                onClick={handleOpenModal}
              />
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <TeamReadiness tracker={tracker} />
          </div>
        </div>
      </div>

      {/* Milestone Modal */}
      {selectedMilestone && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setSelectedMilestone(null)} />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[var(--card)] border-l border-[var(--border)] z-50 flex flex-col shadow-2xl animate-in slide-in-from-right">
            <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--muted)]/30">
              <h2 className="text-lg font-bold text-[var(--foreground)]">{selectedMilestone.name}</h2>
              <button onClick={() => setSelectedMilestone(null)} className="p-2 rounded-full hover:bg-[var(--border)] text-[var(--muted-foreground)] transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Status</label>
                  <select 
                    value={status} onChange={e => setStatus(e.target.value)}
                    disabled={!isLeader}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none disabled:opacity-60"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Deadline</label>
                  <input 
                    type="date"
                    value={deadline} onChange={e => setDeadline(e.target.value)}
                    disabled={!isLeader}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-[var(--foreground)]">Progress</label>
                  <span className="text-xs font-bold text-[var(--primary)]">{progress}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" step="5"
                  value={progress} onChange={e => setProgress(Number(e.target.value))}
                  disabled={!isLeader && !assigned.includes(user?._id || '')}
                  className="w-full accent-[var(--primary)] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Notes / Updates</label>
                <textarea 
                  value={notes} onChange={e => setNotes(e.target.value)}
                  disabled={!isLeader && !assigned.includes(user?._id || '')}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm focus:border-[var(--primary)] outline-none resize-none disabled:opacity-60"
                  placeholder="Link documents, add updates..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Assigned Members</label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {teamMembers.map(member => (
                    <label key={member._id} className={`flex items-center gap-3 p-2 rounded-lg transition-colors border ${isLeader ? 'cursor-pointer hover:bg-[var(--muted)] hover:border-[var(--border)] border-transparent' : 'border-transparent'}`}>
                      <input 
                        type="checkbox" 
                        checked={assigned.includes(member._id)}
                        onChange={() => toggleAssignee(member._id)}
                        disabled={!isLeader}
                        className="w-4 h-4 text-[var(--primary)] rounded border-[var(--border)] focus:ring-[var(--primary)] disabled:opacity-50"
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

            </div>

            <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--card)] flex justify-end gap-3">
              <button 
                onClick={() => setSelectedMilestone(null)}
                className="px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
              >
                Cancel
              </button>
              {(isLeader || assigned.includes(user?._id || '')) && (
                <button 
                  onClick={handleSave}
                  className="px-6 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90 rounded-lg flex items-center gap-2 transition-opacity"
                >
                  <Save size={16} /> Save Changes
                </button>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
