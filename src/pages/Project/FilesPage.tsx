import React, { useState } from 'react';
import { useTeamResources, TeamResource } from '../../hooks/useTeamResources';
import { useAuth } from '../../context/AuthContext';
import { Folder, Link, FileText, Video, Database, Globe, Copy, ExternalLink, Plus, Trash2, Edit2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FilesPage() {
  const { resources, loading, addResource, updateResource, deleteResource } = useTeamResources();
  const { user } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<TeamResource>>({
    title: '', url: '', description: '', category: 'Other'
  });

  const isLeader = user?.role === 'Leader' || user?.role === 'Co-Leader';

  const getIcon = (category: string) => {
    switch(category) {
      case 'Google Drive': return <Folder size={24} />;
      case 'Documentation': return <FileText size={24} />;
      case 'PPT': return <FileText size={24} className="text-orange-500" />;
      case 'Video': return <Video size={24} className="text-red-500" />;
      case 'Dataset': return <Database size={24} className="text-emerald-500" />;
      default: return <Link size={24} />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url) return;
    try {
      if (editingId) {
        await updateResource(editingId, formData);
      } else {
        await addResource(formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ title: '', url: '', description: '', category: 'Other' });
    } catch (err) {
      // handled in hook
    }
  };

  const handleEdit = (r: TeamResource) => {
    setFormData({ title: r.title, url: r.url, description: r.description, category: r.category });
    setEditingId(r._id);
    setIsModalOpen(true);
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)]">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <Folder className="text-[var(--primary)]" /> Files & Resources
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Manage team drive links, documents, and reference materials.</p>
        </div>
        {isLeader && (
          <button onClick={() => { setEditingId(null); setFormData({ title: '', url: '', description: '', category: 'Other' }); setIsModalOpen(true); }} className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
            <Plus size={18} /> Add Resource
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--muted-foreground)]">Loading...</div>
      ) : resources.length === 0 ? (
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] mb-4">
            <Folder size={32} />
          </div>
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">No files added yet</h2>
          <p className="text-sm text-[var(--muted-foreground)] max-w-md">The leader can add Google Drive links, presentation decks, or dataset links for the team to access quickly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(resource => (
            <div key={resource._id} className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 hover:border-[var(--primary)]/50 transition-colors group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                  {getIcon(resource.category)}
                </div>
                {isLeader && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(resource)} className="p-1.5 text-[var(--muted-foreground)] hover:text-blue-500 rounded-lg hover:bg-[var(--muted)]"><Edit2 size={16} /></button>
                    <button onClick={() => deleteResource(resource._id)} className="p-1.5 text-[var(--muted-foreground)] hover:text-red-500 rounded-lg hover:bg-[var(--muted)]"><Trash2 size={16} /></button>
                  </div>
                )}
              </div>
              
              <h3 className="font-bold text-[var(--foreground)] mb-2 line-clamp-2">{resource.title}</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-4 line-clamp-3 flex-1">{resource.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] mt-auto">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-1 rounded-md">{resource.category}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => copyLink(resource.url)} className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--muted)] hover:bg-[var(--border)] rounded-lg transition-colors" title="Copy Link">
                    <Copy size={16} />
                  </button>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="p-2 text-white bg-[var(--primary)] hover:opacity-90 rounded-lg transition-opacity flex items-center gap-2" title="Open Link">
                    <ExternalLink size={16} /> <span className="text-xs font-bold hidden sm:inline">Open</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--card)] rounded-2xl w-full max-w-md border border-[var(--border)] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-bold text-[var(--foreground)]">{editingId ? 'Edit Resource' : 'Add Resource'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] outline-none focus:border-[var(--primary)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">URL / Link</label>
                <input required type="url" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] outline-none focus:border-[var(--primary)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] outline-none focus:border-[var(--primary)]">
                  {['Google Drive', 'Documentation', 'PPT', 'Video', 'Dataset', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Description (Optional)</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] outline-none focus:border-[var(--primary)] resize-none" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--muted)] hover:bg-[var(--border)] rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] hover:opacity-90 rounded-lg transition-opacity">{editingId ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
