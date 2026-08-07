import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import { problems } from '../../data/problems';
import { Link } from 'react-router-dom';
import { Lightbulb, Users, ArrowRight, Loader2, BookOpen } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function IdeasPage() {
  const { user } = useAuth();
  const { research } = useAppContext();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.teamId) {
      api.get(`/teams/${user.teamId}`)
        .then(res => {
          setMembers(res.data.members || []);
        })
        .catch(err => {
          toast.error('Failed to load team members');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading || research.loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={32} className="animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  // Get all bookmarked research entries
  const allBookmarks = research.data.research.filter(r => r.bookmarkedBy && r.bookmarkedBy.length > 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl dark:bg-yellow-900/30 dark:text-yellow-500">
          <Lightbulb size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Team Ideas</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Problems bookmarked by your team members</p>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-10 text-[var(--muted-foreground)]">No members found in your team.</div>
      ) : (
        <div className="space-y-10">
          {members.map(member => {
            // Find all research items bookmarked by this member
            const memberBookmarks = allBookmarks.filter(r => r.bookmarkedBy.includes(member._id));
            
            return (
              <div key={member._id} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-[var(--border)] pb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.fullName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-white text-xs font-bold">{member.fullName.charAt(0)}</span>
                    )}
                  </div>
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">{member.fullName}'s Ideas</h2>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] text-xs font-medium">
                    {memberBookmarks.length}
                  </span>
                </div>

                {memberBookmarks.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-[var(--border)] rounded-2xl bg-[var(--card)]/50">
                    <p className="text-sm text-[var(--muted-foreground)]">{member.fullName} hasn't bookmarked any problems yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {memberBookmarks.map(bm => {
                      const problem = problems.find(p => p.id === bm.problemStatementId);
                      if (!problem) return null;
                      
                      return (
                        <div key={bm.problemStatementId} className="group bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--primary)] transition-colors flex flex-col justify-between shadow-sm">
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <span className="px-2 py-1 bg-[var(--muted)] text-[var(--foreground)] text-[10px] font-bold rounded uppercase tracking-wider">
                                {problem.id}
                              </span>
                              <span className="text-xs font-medium text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-1 rounded">
                                {problem.theme}
                              </span>
                            </div>
                            <h3 className="font-semibold text-[var(--foreground)] text-sm line-clamp-2 mb-2 group-hover:text-[var(--primary)] transition-colors">
                              {problem.title}
                            </h3>
                            <p className="text-xs text-[var(--muted-foreground)] line-clamp-3">
                              {problem.description}
                            </p>
                          </div>
                          
                          <Link to={`/problems/${problem.id}`} className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
                            <span className="flex items-center gap-2"><BookOpen size={14} /> View Details</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
