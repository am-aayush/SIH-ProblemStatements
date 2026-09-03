import React, { useState, useMemo, useEffect } from "react";
import { Search, Filter, Grid3X3, List, AlignJustify, ArrowUpDown, ChevronLeft, ChevronRight, Database, Play } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { problems } from "../../data/problems";
import { ProblemCard } from "../../components/cards/ProblemCard";
import { CompactRow } from "../../components/cards/CompactRow";
import { FilterPanel } from "../../components/filters/FilterPanel";
import { ThemeBadge } from "../../components/common/ThemeBadge";
import { CatBadge } from "../../components/common/CatBadge";
import { useAppContext } from "../../context/AppContext";
import { ViewMode, SortKey, Problem } from "../../types";

export default function ProblemsPage() {
  const { search, compareIds, toggleCompare, research } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle initialization from location state if we navigated here with a filter
  const initialTheme = location.state?.theme as string | undefined;
  const initialOrg = location.state?.org as string | undefined;

  const [view, setView] = useState<ViewMode>("grid");
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = view === "grid" ? 18 : view === "compact" ? 30 : 20;
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    orgs: initialOrg ? [initialOrg] : [] as string[],
    themes: initialTheme ? [initialTheme] : [] as string[],
    cats: [] as string[],
    hasDataset: false,
    hasYoutube: false,
    stages: [] as string[],
  });

  useEffect(() => {
    if (initialTheme) setFilters(f => ({ ...f, themes: [initialTheme] }));
    if (initialOrg) setFilters(f => ({ ...f, orgs: [initialOrg] }));
  }, [initialTheme, initialOrg]);

  const filtered = useMemo(() => {
    let res = problems.filter(p => {
      const yearMatches = (p.year || 2025) === selectedYear;
      if (!yearMatches) return false;

      const q = search.toLowerCase();
      const matchSearch = !q || [p.title, p.description, p.organization, p.department, p.theme, p.category, String(p.id)]
        .some(v => v.toLowerCase().includes(q));
      const matchOrg = !filters.orgs.length || filters.orgs.includes(p.organization);
      const matchTheme = !filters.themes.length || filters.themes.includes(p.theme);
      const matchCat = !filters.cats.length || filters.cats.includes(p.category);
      const matchDataset = !filters.hasDataset || !!p.datasetLinks;
      const matchYoutube = !filters.hasYoutube || !!p.youtubeLinks;
      const pr = research.getProblemResearch(p.id);
      const matchStage = !filters.stages.length || filters.stages.includes(pr ? pr.status : 'Available');
      return matchSearch && matchOrg && matchTheme && matchCat && matchDataset && matchYoutube && matchStage;
    });
    res.sort((a, b) => {
      let va: any = sortKey === "id" ? a.id : String(a[sortKey as keyof Problem]);
      let vb: any = sortKey === "id" ? b.id : String(b[sortKey as keyof Problem]);
      
      if (sortKey === "rating") {
        va = research.getAverageRating(a.id);
        vb = research.getAverageRating(b.id);
      } else if (sortKey === "bookmarks") {
        va = research.getProblemResearch(a.id)?.bookmarkedBy.length || 0;
        vb = research.getProblemResearch(b.id)?.bookmarkedBy.length || 0;
      } else if (sortKey === "comments") {
        va = research.getProblemComments(a.id).length;
        vb = research.getProblemComments(b.id).length;
      }
      
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortAsc ? cmp : -cmp;
    });
    return res;
  }, [search, filters, sortKey, sortAsc, selectedYear]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  useEffect(() => setPage(1), [search, filters, view, sortKey, sortAsc, selectedYear]);

  const sort = (key: SortKey) => { if (sortKey === key) setSortAsc(a => !a); else { setSortKey(key); setSortAsc(true); } };

  return (
    <div className="flex gap-6 h-full">
      {/* Sidebar filter */}
      <div className="hidden lg:block w-60 flex-shrink-0">
        <div className="sticky top-0 bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4">
          <FilterPanel filters={filters} setFilters={setFilters} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Controls */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="flex bg-[var(--muted)] rounded-lg p-1 mr-2">
            <button 
              onClick={() => setSelectedYear(2025)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${selectedYear === 2025 ? "bg-[var(--primary)] text-white shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
            >
              SIH 2025
            </button>
            <button 
              onClick={() => setSelectedYear(2026)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${selectedYear === 2026 ? "bg-[var(--primary)] text-white shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
            >
              SIH 2026
            </button>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--foreground)]">{filtered.length}</span> problems
          </p>
          <div className="flex-1" />
          <button onClick={() => setShowFilters(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors">
            <Filter size={14} />Filters
          </button>
          <div className="flex items-center gap-1 bg-[var(--muted)] rounded-lg p-1">
            {([["grid", Grid3X3], ["table", List], ["compact", AlignJustify]] as const).map(([v, Icon]) => (
              <button key={v} onClick={() => setView(v)}
                className={`p-1.5 rounded-md transition-colors ${view === v ? "bg-[var(--card)] shadow-sm text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}>
                <Icon size={15} />
              </button>
            ))}
          </div>
          <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}
            className="text-sm px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] outline-none">
            {[["id", "Problem ID"], ["title", "Title"], ["organization", "Organization"], ["theme", "Theme"], ["category", "Category"], ["rating", "Highest Rated"], ["bookmarks", "Most Bookmarked"], ["comments", "Most Discussed"]].map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <button onClick={() => setSortAsc(a => !a)}
            className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            <ArrowUpDown size={15} className={sortAsc ? "" : "rotate-180"} />
          </button>
        </div>

        {/* Grid view */}
        {view === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {paged.map(p => (
              <ProblemCard key={p.id} p={p}
                onSelect={(p) => navigate(`/problems/${p.id}`)} compareIds={compareIds} onCompareToggle={toggleCompare} />
            ))}
          </div>
        )}

        {/* Table view */}
        {view === "table" && (
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                    {[["id", "ID"], ["title", "Title"], ["organization", "Organization"], ["theme", "Theme"], ["category", "Category"]].map(([key, label]) => (
                      <th key={key} className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider cursor-pointer hover:text-[var(--foreground)] transition-colors"
                        onClick={() => sort(key as SortKey)}>
                        <div className="flex items-center gap-1">{label}<ArrowUpDown size={11} /></div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Links</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((p, i) => (
                    <tr key={p.id} onClick={() => navigate(`/problems/${p.id}`)}
                      className={`cursor-pointer border-b border-[var(--border)] hover:bg-[var(--muted)] transition-colors
                        ${i % 2 === 0 ? "" : "bg-[var(--muted)]/30"}`}>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--primary)] font-semibold">#{p.id}</td>
                      <td className="px-4 py-3 max-w-xs">
                        <span className="font-medium text-[var(--foreground)] line-clamp-2 text-xs leading-relaxed">{p.title}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--muted-foreground)] max-w-[140px] truncate">{p.organization}</td>
                      <td className="px-4 py-3"><ThemeBadge theme={p.theme} /></td>
                      <td className="px-4 py-3"><CatBadge cat={p.category} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {p.datasetLinks && <Database size={13} className="text-[var(--primary)]" />}
                          {p.youtubeLinks && <Play size={13} className="text-red-500" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Compact view */}
        {view === "compact" && (
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-2">
            {paged.map(p => (
              <CompactRow key={p.id} p={p} onSelect={(p) => navigate(`/problems/${p.id}`)} />
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <Search size={40} className="text-[var(--muted-foreground)] mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium text-[var(--foreground)]">No results found</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              const p = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                    ${page === p ? "bg-[var(--primary)] text-white" : "border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-[var(--card)] rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto">
            <FilterPanel filters={filters} setFilters={setFilters} onClose={() => setShowFilters(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
