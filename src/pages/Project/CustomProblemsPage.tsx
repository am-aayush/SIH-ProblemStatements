import React, { useState } from 'react';
import { useCustomProblems, CustomProblem } from '../../hooks/useCustomProblems';
import { useAuth } from '../../context/AuthContext';
import { Plus, MessageSquare, Lightbulb, User as UserIcon, Send, Trash2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CustomProblemsPage() {
  const { problems, loading, addProblem, deleteProblem, voteProblem, addComment } = useCustomProblems();
  const { user } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [solution, setSolution] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    
    setSubmitting(true);
    try {
      await addProblem({ title, description, solution });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setSolution('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async (problemId: string) => {
    if (!commentText.trim()) return;
    try {
      await addComment(problemId, commentText);
      setCommentText('');
    } catch (err) {
      console.error(err);
    }
  };

  const getVoteAverage = (problem: CustomProblem) => {
    if (!problem.votes || problem.votes.length === 0) return 0;
    const sum = problem.votes.reduce((acc, v) => acc + v.vote, 0);
    return (sum / problem.votes.length).toFixed(1);
  };

  const getUserVote = (problem: CustomProblem) => {
    return problem.votes?.find(v => v.userId._id === user?._id)?.vote || 0;
  };

  const isLeader = user?.role === 'Leader' || user?.role === 'CoLeader';

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Custom Problems</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">Brainstorm and track internal problem statements</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <Plus size={16} /> Add Custom Problem
        </button>
      </div>

      <div className="flex-1 overflow-auto space-y-6 pb-10">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
          </div>
        ) : problems.length === 0 ? (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-[var(--muted)] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="text-[var(--muted-foreground)]" size={32} />
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">No Custom Problems</h3>
            <p className="text-[var(--muted-foreground)] max-w-sm mx-auto mb-6">
              Start brainstorming by adding a custom problem statement and potential solutions.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[var(--primary)] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Add Your First Problem
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {problems.map(problem => (
              <div key={problem._id} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <h3 className="text-lg font-bold text-[var(--foreground)]">{problem.title}</h3>
                    {(isLeader || problem.createdBy._id === user?._id) && (
                      <button 
                        onClick={() => {
                          if (window.confirm('Delete this problem?')) deleteProblem(problem._id);
                        }}
                        className="text-red-500/70 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2.5 py-1 bg-[var(--muted)] text-[var(--foreground)] text-xs font-medium rounded-full">
                      {problem.status}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                      By {problem.createdBy.fullName} • {formatDistanceToNow(new Date(problem.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Description</h4>
                      <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">{problem.description}</p>
                    </div>

                    {problem.solution && (
                      <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/20 p-4 rounded-xl">
                        <h4 className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider mb-2 flex items-center gap-2">
                          <Lightbulb size={14} /> Proposed Solution
                        </h4>
                        <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">{problem.solution}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-[var(--border)] p-4 bg-[var(--muted)]/30 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star}
                        onClick={() => voteProblem(problem._id, star)}
                        className={`text-xl focus:outline-none transition-transform hover:scale-110 ${getUserVote(problem) >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-xs font-medium text-[var(--muted-foreground)] ml-2">
                      {getVoteAverage(problem)} ({problem.votes?.length || 0})
                    </span>
                  </div>

                  <button 
                    onClick={() => setExpandedId(expandedId === problem._id ? null : problem._id)}
                    className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    <MessageSquare size={16} />
                    {problem.comments?.length || 0} Comments
                  </button>
                </div>

                {/* Comments Section */}
                {expandedId === problem._id && (
                  <div className="border-t border-[var(--border)] p-4 bg-[var(--muted)]/10 space-y-4">
                    <div className="max-h-60 overflow-y-auto space-y-4 pr-2">
                      {problem.comments?.map(comment => (
                        <div key={comment._id} className="flex gap-3">
                          {comment.userId.avatar ? (
                            <img src={comment.userId.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {comment.userId.fullName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="bg-[var(--muted)] px-3 py-2 rounded-2xl rounded-tl-sm text-sm text-[var(--foreground)]">
                              <span className="font-bold text-xs block mb-1">{comment.userId.fullName}</span>
                              {comment.message}
                            </div>
                            <span className="text-[10px] text-[var(--muted-foreground)] ml-1 mt-1 block">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      ))}
                      {(!problem.comments || problem.comments.length === 0) && (
                        <p className="text-center text-xs text-[var(--muted-foreground)] py-4">No comments yet. Be the first!</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 relative">
                      <input 
                        type="text" 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(problem._id)}
                        placeholder="Add a comment..." 
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-full pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
                      />
                      <button 
                        onClick={() => handleAddComment(problem._id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--primary)] p-1 hover:bg-[var(--primary)]/10 rounded-full transition-colors"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--card)] w-full max-w-lg rounded-3xl shadow-xl border border-[var(--border)] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--muted)]/30">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Add Custom Problem</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Problem Title <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Enter a clear title"
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Description <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe the problem in detail..."
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary)] min-h-[120px] resize-y"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Proposed Solution <span className="text-[var(--muted-foreground)] font-normal">(Optional)</span></label>
                  <textarea 
                    value={solution}
                    onChange={e => setSolution(e.target.value)}
                    placeholder="How would you solve this problem?"
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary)] min-h-[120px] resize-y"
                  />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-[var(--primary)] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? 'Adding...' : 'Add Problem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
