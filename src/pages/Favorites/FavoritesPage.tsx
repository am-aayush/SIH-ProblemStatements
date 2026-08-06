import React from "react";
import { Star } from "lucide-react";
import { problems } from "../../data/problems";
import { ProblemCard } from "../../components/cards/ProblemCard";
import { useAppContext } from "../../context/AppContext";

export default function FavoritesPage() {
  const { bookmarks, toggleBookmark, setSelectedProblem, compareIds, toggleCompare } = useAppContext();
  const saved = problems.filter(p => bookmarks.has(p.id));
  
  if (!saved.length) return (
    <div className="text-center py-24">
      <Star size={48} className="text-[var(--muted-foreground)] mx-auto mb-4 opacity-30" />
      <p className="text-lg font-medium text-[var(--foreground)]">No saved problems yet</p>
      <p className="text-sm text-[var(--muted-foreground)] mt-1">Bookmark problems from the explorer to save them here</p>
    </div>
  );
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Favorites</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{saved.length} saved problem{saved.length !== 1 ? "s" : ""}</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {saved.map(p => (
          <ProblemCard key={p.id} p={p} bookmarks={bookmarks} onBookmark={toggleBookmark}
            onSelect={setSelectedProblem} compareIds={compareIds} onCompareToggle={toggleCompare} />
        ))}
      </div>
    </div>
  );
}
