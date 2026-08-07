import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { problems } from '../../data/problems';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Bookmark, BookmarkCheck, Database, Play, CheckCircle, Save, Edit2, MessageSquare, Star, Trash2, Send } from 'lucide-react';
import { ThemeBadge } from '../../components/common/ThemeBadge';
import { CatBadge } from '../../components/common/CatBadge';
import { PipelineStage } from '../../types/research';
import { NotesWorkspace } from '../../components/research/NotesWorkspace';
import { ResourcesWorkspace } from '../../components/research/ResourcesWorkspace';
import { TechStackWorkspace } from '../../components/research/TechStackWorkspace';

const STAGES: PipelineStage[] = ['Available', 'Bookmarked', 'Researching', 'Voting', 'Shortlisted', 'Final Selected'];

export default function ProblemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { research, bookmarks, toggleBookmark } = useAppContext();
  const { user } = useAuth();
  
  const problem = problems.find(p => p.id === Number(id));
  
  const [newComment, setNewComment] = useState('');

  if (!problem) {
    return <div className="p-8 text-center text-[var(--foreground)]">Problem not found.</div>;
  }

  const pr = research.getProblemResearch(problem.id);
  const comments = research.getProblemComments(problem.id);
  const rating = research.getAverageRating(problem.id);
  const myVote = research.getProblemVotes(problem.id).find(v => v.userId === user?._id)?.vote || 0;
  
  const isLeader = user?.role === 'Leader' || user?.role === 'Co-Leader';
  const currentStage = pr?.status || 'Available';

  const handleStageChange = (stage: PipelineStage) => {
    if (['Shortlisted', 'Final Selected'].includes(stage) && !isLeader) {
      alert('Only Leader or Co-Leader can move to this stage.');
      return;
    }
    if (stage === 'Final Selected') {
      if (window.confirm('Are you sure you want to finalize this problem? This will lock all other problems.')) {
        research.finalizeProblem(problem.id);
      }
    } else {
      research.updateStage(problem.id, stage);
    }
  };

  const handleVote = (star: number) => {
    research.voteProblem(problem.id, star);
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    research.addComment(problem.id, newComment);
    setNewComment('');
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ArrowLeft size={20} /> Back
        </button>
        <div className="flex items-center gap-3">
          {pr?.isFinalSelected && (
            <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg">
              <CheckCircle size={16} /> Final Selected
            </span>
          )}
          <button onClick={() => toggleBookmark(problem.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-amber-500 transition-colors">
            {bookmarks.has(problem.id) ? <BookmarkCheck size={18} className="text-amber-500" /> : <Bookmark size={18} />}
            <span className="text-sm font-medium">Bookmark</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Problem Details */}
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6">
            <div className="flex gap-2 mb-4">
              <span className="text-sm font-mono font-semibold text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-1 rounded">#{problem.id}</span>
              <ThemeBadge theme={problem.theme} />
              <CatBadge cat={problem.category} />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-[var(--foreground)] mb-4">{problem.title}</h1>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed whitespace-pre-wrap">{problem.description}</p>
            
            <div className="mt-6 pt-6 border-t border-[var(--border)] grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[var(--muted-foreground)] font-semibold uppercase tracking-wider mb-1">Organization</p>
                <p className="text-sm text-[var(--foreground)] font-medium">{problem.organization}</p>
              </div>
              {problem.department && (
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] font-semibold uppercase tracking-wider mb-1">Department</p>
                  <p className="text-sm text-[var(--foreground)] font-medium">{problem.department}</p>
                </div>
              )}
            </div>
            
            {(problem.datasetLinks || problem.youtubeLinks) && (
              <div className="mt-6 pt-6 border-t border-[var(--border)] flex gap-3">
                {problem.datasetLinks && (
                  <a href={problem.datasetLinks.split(":").find(l => l.startsWith("http"))} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
                    <Database size={16} /> Dataset Links
                  </a>
                )}
                {problem.youtubeLinks && (
                  <a href={problem.youtubeLinks} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:opacity-90 transition-opacity">
                    <Play size={16} /> YouTube
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Research Workspace Widgets */}
          <NotesWorkspace problemId={problem.id} research={pr} />
          <ResourcesWorkspace problemId={problem.id} research={pr} />
          <TechStackWorkspace problemId={problem.id} research={pr} />
        </div>

        <div className="space-y-6">
          {/* Pipeline Stepper */}
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6">
            <h2 className="text-sm font-bold text-[var(--foreground)] mb-4">Pipeline Stage</h2>
            <div className="flex flex-col gap-2">
              {STAGES.map((stage, idx) => {
                const isActive = stage === currentStage;
                const isPassed = STAGES.indexOf(currentStage) >= idx;
                return (
                  <button key={stage} onClick={() => handleStageChange(stage)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors
                      ${isActive ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)] hover:bg-[var(--muted)]'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold
                      ${isActive ? 'bg-[var(--primary)] text-white' : isPassed ? 'bg-[var(--primary)]/30 text-[var(--primary)]' : 'bg-[var(--muted-foreground)]/20 text-[var(--muted-foreground)]'}`}>
                      {isActive ? <CheckCircle size={12} /> : idx + 1}
                    </div>
                    <span className={`text-sm font-medium ${isActive ? 'text-[var(--primary)]' : isPassed ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}`}>
                      {stage}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voting */}
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6">
            <h2 className="text-sm font-bold text-[var(--foreground)] mb-4">Team Voting</h2>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[var(--muted-foreground)]">Average Rating</span>
              <div className="flex items-center gap-1 font-bold text-lg text-[var(--foreground)]">
                <Star className="text-amber-500 fill-amber-500" size={20} /> {rating}
              </div>
            </div>
            <div className="pt-4 border-t border-[var(--border)]">
              <span className="text-xs text-[var(--muted-foreground)] block mb-2">Your Vote</span>
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => handleVote(star)}
                    className={`p-2 rounded-lg transition-colors hover:bg-[var(--muted)] ${myVote >= star ? 'text-amber-500' : 'text-[var(--border)]'}`}>
                    <Star size={24} className={myVote >= star ? "fill-amber-500" : ""} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] flex flex-col h-[500px]">
            <div className="p-4 border-b border-[var(--border)] flex items-center gap-2">
              <MessageSquare size={18} className="text-[var(--primary)]" />
              <h2 className="text-sm font-bold text-[var(--foreground)]">Discussion ({comments.length})</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.map(c => (
                <div key={c._id} className="flex gap-3">
                  <img src={c.userId.avatar || `https://ui-avatars.com/api/?name=${c.userId.fullName}&background=random`} alt="" className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--foreground)]">{c.userId.fullName}</span>
                        {(c.userId.role === 'Leader' || c.userId.role === 'Co-Leader') && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 px-1.5 py-0.5 rounded font-bold">{c.userId.role}</span>
                        )}
                      </div>
                      {(c.userId._id === user?._id || isLeader) && (
                        <button onClick={() => research.deleteComment(problem.id, c._id)} className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] bg-[var(--muted)] p-3 rounded-r-xl rounded-bl-xl leading-relaxed">
                      {c.message}
                    </p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-center text-[var(--muted-foreground)] mt-10">No comments yet. Start the discussion!</p>
              )}
            </div>
            <form onSubmit={submitComment} className="p-4 border-t border-[var(--border)] flex gap-2">
              <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
                placeholder="Type your thought..." className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] outline-none focus:border-[var(--primary)]" />
              <button type="submit" disabled={!newComment.trim()}
                className="p-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
