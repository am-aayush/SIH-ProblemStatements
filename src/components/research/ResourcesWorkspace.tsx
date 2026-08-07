import React, { useState } from 'react';
import { ProblemResearch, ResearchResource } from '../../types/research';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Link, Database, Book, FileText, Video, Globe, Plus, Trash2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export function ResourcesWorkspace({ problemId, research }: { problemId: number, research?: ProblemResearch }) {
  const { research: researchContext } = useAppContext();
  const { user } = useAuth();
  
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', url: '', description: '', category: 'Website' });

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Dataset': return <Database size={16} />;
      case 'GitHub': return <Globe size={16} />;
      case 'Documentation': return <Book size={16} />;
      case 'Research Paper': return <FileText size={16} />;
      case 'Video': return <Video size={16} />;
      default: return <Link size={16} />;
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url) return;
    try {
      await researchContext.addResource(problemId, formData);
      setIsAdding(false);
      setFormData({ title: '', url: '', description: '', category: 'Website' });
      toast.success('Resource added');
    } catch (err) {
      toast.error('Failed to add resource');
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await researchContext.deleteResource(problemId, resourceId);
      toast.success('Resource deleted');
    } catch (err) {
      toast.error('Failed to delete resource');
    }
  };

  const resources = research?.resources || [];

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">Resources & Datasets</h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Links, datasets, and references.</p>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2 text-sm text-[var(--primary)] hover:underline font-medium">
          <Plus size={16} /> Add Resource
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddResource} className="bg-[var(--muted)]/50 p-4 rounded-xl border border-[var(--border)] mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] outline-none focus:border-[var(--primary)]" />
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] outline-none focus:border-[var(--primary)]">
              {['Dataset', 'GitHub', 'Documentation', 'Research Paper', 'Video', 'Website'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <input required type="url" placeholder="URL (https://...)" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] outline-none focus:border-[var(--primary)]" />
          <textarea placeholder="Description (optional)" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] outline-none focus:border-[var(--primary)] resize-none" rows={2} />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-xs font-medium bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity">Save Resource</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map(resource => {
          const isOwner = resource.addedBy?._id === user?._id || user?.role === 'Leader' || user?.role === 'Co-Leader';
          return (
            <div key={resource._id} className="flex flex-col border border-[var(--border)] bg-[var(--muted)]/20 rounded-xl p-4 hover:border-[var(--primary)]/50 transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">
                    {getCategoryIcon(resource.category)}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] tracking-wider">{resource.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
                    <ExternalLink size={14} />
                  </a>
                  {isOwner && (
                    <button onClick={() => handleDeleteResource(resource._id!)} className="text-[var(--muted-foreground)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              <h3 className="font-bold text-sm text-[var(--foreground)] mb-1 truncate">{resource.title}</h3>
              {resource.description && <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">{resource.description}</p>}
            </div>
          );
        })}
        {resources.length === 0 && !isAdding && (
          <div className="col-span-full text-center py-6 text-[var(--muted-foreground)] text-sm">
            No resources added yet.
          </div>
        )}
      </div>
    </div>
  );
}
