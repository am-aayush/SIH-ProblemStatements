import { Bookmark, BookmarkCheck, Building, GraduationCap, Database, Play, GitCompare, Star, Users, CheckCircle, Activity } from "lucide-react";
import { ThemeBadge } from "../common/ThemeBadge";
import { CatBadge } from "../common/CatBadge";
import { Problem } from "../../types";
import { useAppContext } from "../../context/AppContext";

export function ProblemCard({ p, onSelect, compareIds, onCompareToggle }: {
  p: Problem; onSelect: (p: Problem) => void; compareIds: Set<number>; onCompareToggle: (id: number) => void;
}) {
  const { bookmarks, toggleBookmark, research } = useAppContext();
  const inCompare = compareIds.has(p.id);
  
  const pr = research.getProblemResearch(p.id);
  const rating = research.getAverageRating(p.id);
  const voteCount = research.getProblemVotes(p.id).length;
  const bookmarkedCount = pr ? pr.bookmarkedBy.length : 0;
  return (
    <div className={`group relative bg-[var(--card)] rounded-2xl border transition-all duration-200 flex flex-col
      hover:shadow-lg hover:-translate-y-0.5 cursor-pointer
      ${inCompare ? "border-[var(--primary)] shadow-md" : "border-[var(--border)] hover:border-blue-300 dark:hover:border-blue-700"}`}
      onClick={() => onSelect(p)}>
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="text-xs font-mono font-semibold text-[var(--primary)]">#{p.id}</span>
          <div className="flex items-center gap-2">
            {pr?.isFinalSelected && (
              <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
                <CheckCircle size={10} /> Final
              </span>
            )}
            <button onClick={e => { e.stopPropagation(); toggleBookmark(p.id); }}
              className="text-[var(--muted-foreground)] hover:text-amber-500 transition-colors">
              {bookmarks.has(p.id) ? <BookmarkCheck size={16} className="text-amber-500" /> : <Bookmark size={16} />}
            </button>
          </div>
        </div>
        <h3 className="font-semibold text-[var(--foreground)] text-sm leading-snug mb-2 line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
          {p.title}
        </h3>
        
        {/* Insights Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-3 pb-3 border-b border-[var(--border)] text-[11px] font-medium text-[var(--muted-foreground)]">
          <span className={`px-1.5 py-0.5 rounded-md ${pr ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'bg-[var(--muted)]'}`}>
            {pr ? pr.status : 'Available'}
          </span>
          <div className="flex items-center gap-1" title="Average Rating">
            <Star size={11} className={rating > 0 ? "text-amber-500 fill-amber-500" : ""} /> {rating || 'No votes'} ({voteCount})
          </div>
          <div className="flex items-center gap-1" title="Researchers">
            <Users size={11} /> {bookmarkedCount}
          </div>
        </div>

        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-2 mb-3">{p.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <ThemeBadge theme={p.theme} />
          <CatBadge cat={p.category} />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <Building size={11} /><span className="truncate">{p.organization}</span>
          </div>
          {p.department && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
              <GraduationCap size={11} /><span className="truncate">{p.department}</span>
            </div>
          )}
        </div>
      </div>
      <div className="px-5 pb-4 flex items-center gap-2 border-t border-[var(--border)] pt-3">
        <button onClick={e => { e.stopPropagation(); onSelect(p); }}
          className="flex-1 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:opacity-90 transition-opacity">
          View Details
        </button>
        {p.datasetLinks && (
          <a href={p.datasetLinks.split(":").find(l => l.startsWith("http"))} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="p-1.5 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
            <Database size={14} />
          </a>
        )}
        {p.youtubeLinks && (
          <a href={p.youtubeLinks} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="p-1.5 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-red-500 transition-colors">
            <Play size={14} />
          </a>
        )}
        <button onClick={e => { e.stopPropagation(); onCompareToggle(p.id); }}
          title={inCompare ? "Remove from compare" : "Add to compare"}
          className={`p-1.5 rounded-lg transition-colors ${inCompare ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--primary)]"}`}>
          <GitCompare size={14} />
        </button>
      </div>
    </div>
  );
}
