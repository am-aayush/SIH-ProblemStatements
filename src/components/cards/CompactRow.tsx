import { Bookmark, BookmarkCheck, CheckCircle } from "lucide-react";
import { ThemeBadge } from "../common/ThemeBadge";
import { CatBadge } from "../common/CatBadge";
import { Problem } from "../../types";
import { useAppContext } from "../../context/AppContext";

export function CompactRow({ p, onSelect }: {
  p: Problem; onSelect: (p: Problem) => void;
}) {
  const { bookmarks, toggleBookmark, research } = useAppContext();
  const pr = research.getProblemResearch(p.id);
  return (
    <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl hover:bg-[var(--muted)] transition-colors cursor-pointer group"
      onClick={() => onSelect(p)}>
      <span className="text-xs font-mono text-[var(--primary)] w-16 flex-shrink-0">#{p.id}</span>
      <p className="flex-1 text-sm font-medium text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition-colors">{p.title}</p>
      <div className="flex items-center gap-2 w-28 flex-shrink-0">
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${pr ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}>
          {pr ? pr.status : 'Available'}
        </span>
        {pr?.isFinalSelected && <CheckCircle size={12} className="text-emerald-500" title="Final Selected" />}
      </div>
      <ThemeBadge theme={p.theme} />
      <CatBadge cat={p.category} />
      <span className="text-xs text-[var(--muted-foreground)] hidden lg:block w-32 truncate">{p.organization}</span>
      <button onClick={e => { e.stopPropagation(); toggleBookmark(p.id); }}
        className="text-[var(--muted-foreground)] hover:text-amber-500 transition-colors flex-shrink-0">
        {bookmarks.has(p.id) ? <BookmarkCheck size={15} className="text-amber-500" /> : <Bookmark size={15} />}
      </button>
    </div>
  );
}
