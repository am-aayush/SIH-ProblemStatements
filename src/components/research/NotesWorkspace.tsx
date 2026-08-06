import React, { useState } from 'react';
import { ProblemResearch, ResearchNote } from '../../types/research';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Send, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export function NotesWorkspace({ problemId, research }: { problemId: number, research?: ProblemResearch }) {
  const { research: researchContext } = useAppContext();
  const { user } = useAuth();
  const [newNote, setNewNote] = useState('');

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await researchContext.addNote(problemId, newNote);
      setNewNote('');
      toast.success('Note added');
    } catch (err) {
      toast.error('Failed to add note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await researchContext.deleteNote(problemId, noteId);
      toast.success('Note deleted');
    } catch (err) {
      toast.error('Failed to delete note');
    }
  };

  const notes = research?.notes || [];

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] flex flex-col h-[600px]">
      <div className="p-4 border-b border-[var(--border)]">
        <h2 className="text-lg font-bold text-[var(--foreground)]">Research Notes</h2>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">Document findings, analysis, and ideas.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {notes.map(note => {
          const author = note.author || {};
          const isOwner = author._id === user?._id || user?.role === 'Leader' || user?.role === 'Co-Leader';
          
          return (
            <div key={note._id} className="bg-[var(--muted)]/50 rounded-xl p-4 border border-[var(--border)] group">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {author.avatar ? (
                    <img src={author.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <User size={14} className="text-[var(--muted-foreground)]" />
                  )}
                  <span className="text-xs font-semibold text-[var(--foreground)]">{author.fullName || author.name || 'Unknown'}</span>
                  <span className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-1">
                    <Clock size={10} /> {format(new Date(note.createdAt || Date.now()), 'MMM d, h:mm a')}
                  </span>
                </div>
                {isOwner && (
                  <button onClick={() => handleDeleteNote(note._id!)} className="text-[var(--muted-foreground)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">{note.content}</p>
            </div>
          );
        })}
        {notes.length === 0 && (
          <div className="text-center py-10 text-[var(--muted-foreground)] text-sm">
            No research notes added yet.
          </div>
        )}
      </div>
      
      <form onSubmit={handleAddNote} className="p-4 border-t border-[var(--border)] bg-[var(--muted)]/20">
        <div className="flex gap-2">
          <textarea 
            value={newNote} onChange={e => setNewNote(e.target.value)}
            className="flex-1 p-3 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] outline-none focus:border-[var(--primary)] resize-none h-[60px]"
            placeholder="Type your research note..."
          />
          <button type="submit" disabled={!newNote.trim()} className="px-4 bg-[var(--primary)] text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center">
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
