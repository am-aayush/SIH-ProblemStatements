import React, { useState } from 'react';
import { ProblemResearch, TechStackItem } from '../../types/research';
import { useAppContext } from '../../context/AppContext';
import { Layers, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Frontend', 'Backend', 'Database', 'AI/ML', 'Cloud', 'Libraries', 'APIs', 'Other'];

export function TechStackWorkspace({ problemId, research }: { problemId: number, research?: ProblemResearch }) {
  const { research: researchContext } = useAppContext();
  
  const [isEditing, setIsEditing] = useState(false);
  const [techStack, setTechStack] = useState<TechStackItem[]>(research?.techStack || []);
  const [newItem, setNewItem] = useState({ category: 'Frontend', name: '' });

  const handleSave = async () => {
    try {
      await researchContext.updateTechStack(problemId, techStack);
      setIsEditing(false);
      toast.success('Tech stack saved');
    } catch (err) {
      toast.error('Failed to save tech stack');
    }
  };

  const handleAdd = () => {
    if (!newItem.name.trim()) return;
    setTechStack([...techStack, newItem]);
    setNewItem({ ...newItem, name: '' });
  };

  const handleRemove = (index: number) => {
    setTechStack(techStack.filter((_, i) => i !== index));
  };

  const groupedStack = CATEGORIES.map(cat => ({
    category: cat,
    items: (research?.techStack || []).filter(t => t.category === cat)
  })).filter(g => g.items.length > 0);

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">Proposed Tech Stack</h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">Technologies considered for the solution.</p>
        </div>
        <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className={`flex items-center gap-2 text-sm font-medium ${isEditing ? 'text-emerald-500' : 'text-[var(--primary)]'}`}>
          {isEditing ? 'Save Stack' : 'Edit Stack'}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="flex gap-2 mb-6">
            <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="w-1/3 px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] outline-none">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input 
              value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} 
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="e.g. React, Node.js, MongoDB" 
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] outline-none"
            />
            <button onClick={handleAdd} className="p-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90">
              <Plus size={18} />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {techStack.map((item, idx) => (
              <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--muted)] text-sm font-medium border border-[var(--border)]">
                <span className="text-[10px] text-[var(--muted-foreground)] uppercase mr-1">{item.category}</span>
                {item.name}
                <button onClick={() => handleRemove(idx)} className="text-[var(--muted-foreground)] hover:text-red-500 ml-1">
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedStack.length > 0 ? (
            groupedStack.map(group => (
              <div key={group.category} className="flex flex-col sm:flex-row sm:items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
                <div className="w-24 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                  {group.category}
                </div>
                <div className="flex flex-wrap gap-2 flex-1">
                  {group.items.map((item, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-semibold border border-[var(--primary)]/20">
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-[var(--muted-foreground)] text-sm flex flex-col items-center gap-2">
              <Layers size={24} className="opacity-50" />
              No technologies suggested yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
