import { useState, useMemo, useEffect, useRef } from "react";
import {
  LayoutDashboard, BookOpen, Building2, Layers, GraduationCap,
  Star, GitCompare, Settings, Search, Moon, Sun, Upload,
  Bell, User, ChevronDown, X, ExternalLink, Play,
  Database, Bookmark, BookmarkCheck, Share2, Copy, Check,
  Filter, Grid3X3, List, AlignJustify, ChevronLeft, ChevronRight,
  ArrowUpDown, Menu, SlidersHorizontal, TrendingUp, Hash,
  Building, Tag, Zap, FileText, BarChart3
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { problems, themes, organizations, departments, themeColors, type Problem } from "./data/problems";

type Page = "dashboard" | "problems" | "organizations" | "themes" | "departments" | "favorites" | "compare" | "settings";
type ViewMode = "grid" | "table" | "compact";
type SortKey = "id" | "title" | "organization" | "theme" | "category";

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("sih-dark");
    return stored ? stored === "true" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("sih-dark", String(dark));
  }, [dark]);
  return [dark, setDark] as const;
}

function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Set<number>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("sih-bookmarks") || "[]")); } catch { return new Set(); }
  });
  const toggle = (id: number) => setBookmarks(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    localStorage.setItem("sih-bookmarks", JSON.stringify([...next]));
    return next;
  });
  return [bookmarks, toggle] as const;
}

const THEME_BG: Record<string, string> = {
  "Agriculture, FoodTech & Rural Development": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "Blockchain & Cybersecurity": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  "Clean & Green Technology": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Disaster Management": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  "Fitness & Sports": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  "Heritage & Culture": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  "MedTech / BioTech / HealthTech": "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
  "Miscellaneous": "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
  "Renewable / Sustainable Energy": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  "Robotics and Drones": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  "Smart Automation": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "Smart Education": "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  "Smart Vehicles": "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400",
  "Space Technology": "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
  "Toys & Games": "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
  "Transportation & Logistics": "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
  "Travel & Tourism": "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-400",
};

function Badge({ label, cls }: { label: string; cls: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
}

function ThemeBadge({ theme }: { theme: string }) {
  return <Badge label={theme} cls={THEME_BG[theme] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"} />;
}

function CatBadge({ cat }: { cat: string }) {
  return <Badge label={cat} cls={cat === "Software" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"} />;
}

// ─── Detail Drawer ──────────────────────────────────────────────────────────
function DetailDrawer({ problem, onClose, bookmarks, onBookmark }: {
  problem: Problem | null; onClose: () => void;
  bookmarks: Set<number>; onBookmark: (id: number) => void;
}) {
  const [copied, setCopied] = useState(false);
  const isOpen = !!problem;
  const copyId = () => {
    if (!problem) return;
    navigator.clipboard.writeText(String(problem.id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const getYoutubeId = (url: string) => {
    const m = url.match(/(?:youtu\.be\/|v=|\/embed\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-full max-w-150 z-50 transform transition-transform duration-300 ease-out
        bg-(--card) border-l border-(--border) shadow-2xl overflow-y-auto
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        {problem && (
          <div className="flex flex-col h-full">
            <div className="sticky top-0 bg-(--card) border-b border-(--border) p-5 flex items-start justify-between gap-4 z-10">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-mono font-medium text-(--primary) bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                    #{problem.id}
                  </span>
                  <CatBadge cat={problem.category} />
                </div>
                <h2 className="text-lg font-semibold text-(--foreground) leading-snug">{problem.title}</h2>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-(--muted) transition-colors shrink-0">
                <X size={18} className="text-(--muted-foreground)" />
              </button>
            </div>
            <div className="p-5 space-y-5 flex-1">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Organization", value: problem.organization, icon: <Building size={14} /> },
                  { label: "Department", value: problem.department, icon: <GraduationCap size={14} /> },
                  { label: "Theme", value: problem.theme, icon: <Tag size={14} /> },
                  { label: "Category", value: problem.category, icon: <Layers size={14} /> },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="bg-(--muted) rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-(--muted-foreground) mb-1">
                      {icon}
                      <span className="text-xs font-medium">{label}</span>
                    </div>
                    <p className="text-sm font-medium text-(--foreground) leading-tight">{value || "—"}</p>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-(--foreground) mb-2">Description</h3>
                <p className="text-sm text-(--muted-foreground) leading-relaxed whitespace-pre-wrap">{problem.description}</p>
              </div>
              {problem.datasetLinks && (
                <div>
                  <h3 className="text-sm font-semibold text-(--foreground) mb-2">Dataset Links</h3>
                  <div className="space-y-2">
                    {problem.datasetLinks.split(":").filter(l => l.startsWith("http")).map((link, i) => (
                      <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-(--primary) hover:underline">
                        <Database size={14} />{link.length > 60 ? link.slice(0, 60) + "…" : link}
                        <ExternalLink size={12} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {problem.youtubeLinks && (() => {
                const ytId = getYoutubeId(problem.youtubeLinks);
                return (
                  <div>
                    <h3 className="text-sm font-semibold text-(--foreground) mb-2">YouTube Video</h3>
                    {ytId ? (
                      <div className="rounded-xl overflow-hidden aspect-video">
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}`}
                          className="w-full h-full" allowFullScreen
                          title="Problem Statement Video"
                        />
                      </div>
                    ) : (
                      <a href={problem.youtubeLinks} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-red-500 hover:underline">
                        <Play size={14} />Watch Video<ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                );
              })()}
            </div>
            <div className="sticky bottom-0 bg-(--card) border-t border-(--border) p-4 flex gap-2">
              <button onClick={() => onBookmark(problem.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border
                  ${bookmarks.has(problem.id)
                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                    : "border-(--border) text-(--muted-foreground) hover:bg-(--muted)"}`}>
                {bookmarks.has(problem.id) ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                {bookmarks.has(problem.id) ? "Saved" : "Save"}
              </button>
              <button onClick={copyId}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-all">
                {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                {copied ? "Copied!" : "Copy ID"}
              </button>
              <button onClick={() => { navigator.share?.({ title: problem.title, url: window.location.href }); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-all ml-auto">
                <Share2 size={15} />Share
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Problem Card ────────────────────────────────────────────────────────────
function ProblemCard({ p, bookmarks, onBookmark, onSelect, compareIds, onCompareToggle }: {
  p: Problem; bookmarks: Set<number>; onBookmark: (id: number) => void;
  onSelect: (p: Problem) => void; compareIds: Set<number>; onCompareToggle: (id: number) => void;
}) {
  const inCompare = compareIds.has(p.id);
  return (
    <div className={`group relative bg-[var(--card)] rounded-2xl border transition-all duration-200 flex flex-col
      hover:shadow-lg hover:-translate-y-0.5 cursor-pointer
      ${inCompare ? "border-[var(--primary)] shadow-md" : "border-[var(--border)] hover:border-blue-300 dark:hover:border-blue-700"}`}
      onClick={() => onSelect(p)}>
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="text-xs font-mono font-semibold text-[var(--primary)]">#{p.id}</span>
          <button onClick={e => { e.stopPropagation(); onBookmark(p.id); }}
            className="text-[var(--muted-foreground)] hover:text-amber-500 transition-colors">
            {bookmarks.has(p.id) ? <BookmarkCheck size={16} className="text-amber-500" /> : <Bookmark size={16} />}
          </button>
        </div>
        <h3 className="font-semibold text-[var(--foreground)] text-sm leading-snug mb-3 line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
          {p.title}
        </h3>
        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-3 mb-4">{p.description}</p>
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

// ─── Compact Row ─────────────────────────────────────────────────────────────
function CompactRow({ p, bookmarks, onBookmark, onSelect }: {
  p: Problem; bookmarks: Set<number>; onBookmark: (id: number) => void; onSelect: (p: Problem) => void;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl hover:bg-[var(--muted)] transition-colors cursor-pointer group"
      onClick={() => onSelect(p)}>
      <span className="text-xs font-mono text-[var(--primary)] w-16 flex-shrink-0">#{p.id}</span>
      <p className="flex-1 text-sm font-medium text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition-colors">{p.title}</p>
      <ThemeBadge theme={p.theme} />
      <CatBadge cat={p.category} />
      <span className="text-xs text-[var(--muted-foreground)] hidden lg:block w-32 truncate">{p.organization}</span>
      <button onClick={e => { e.stopPropagation(); onBookmark(p.id); }}
        className="text-[var(--muted-foreground)] hover:text-amber-500 transition-colors flex-shrink-0">
        {bookmarks.has(p.id) ? <BookmarkCheck size={15} className="text-amber-500" /> : <Bookmark size={15} />}
      </button>
    </div>
  );
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────
function FilterPanel({ filters, setFilters, onClose }: {
  filters: { orgs: string[]; themes: string[]; cats: string[]; hasDataset: boolean; hasYoutube: boolean };
  setFilters: (f: typeof filters) => void; onClose?: () => void;
}) {
  const toggle = (key: "orgs" | "themes" | "cats", val: string) => {
    const arr = filters[key];
    setFilters({ ...filters, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] });
  };
  const reset = () => setFilters({ orgs: [], themes: [], cats: [], hasDataset: false, hasYoutube: false });
  const activeCount = filters.orgs.length + filters.themes.length + filters.cats.length + (filters.hasDataset ? 1 : 0) + (filters.hasYoutube ? 1 : 0);

  const [orgSearch, setOrgSearch] = useState("");
  const [themeSearch, setThemeSearch] = useState("");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-[var(--primary)]" />
          <span className="text-sm font-semibold text-[var(--foreground)]">Filters</span>
          {activeCount > 0 && (
            <span className="bg-[var(--primary)] text-white text-xs px-1.5 py-0.5 rounded-full">{activeCount}</span>
          )}
        </div>
        <div className="flex gap-2">
          {activeCount > 0 && (
            <button onClick={reset} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">Reset</button>
          )}
          {onClose && <button onClick={onClose}><X size={16} className="text-[var(--muted-foreground)]" /></button>}
        </div>
      </div>

      <FilterSection title="Category">
        {["Software", "Hardware"].map(cat => (
          <label key={cat} className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" checked={filters.cats.includes(cat)} onChange={() => toggle("cats", cat)}
              className="rounded border-[var(--border)] accent-blue-600" />
            <span className="text-sm text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{cat}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Theme">
        <input value={themeSearch} onChange={e => setThemeSearch(e.target.value)} placeholder="Search themes…"
          className="w-full text-xs px-2 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] outline-none mb-2" />
        <div className="max-h-48 overflow-y-auto space-y-1">
          {themes.filter(t => t.toLowerCase().includes(themeSearch.toLowerCase())).map(t => (
            <label key={t} className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={filters.themes.includes(t)} onChange={() => toggle("themes", t)}
                className="rounded border-[var(--border)] accent-blue-600 flex-shrink-0" />
              <span className="text-xs text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors leading-tight">{t}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Organization">
        <input value={orgSearch} onChange={e => setOrgSearch(e.target.value)} placeholder="Search orgs…"
          className="w-full text-xs px-2 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] outline-none mb-2" />
        <div className="max-h-48 overflow-y-auto space-y-1">
          {organizations.filter(o => o.toLowerCase().includes(orgSearch.toLowerCase())).map(o => (
            <label key={o} className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={filters.orgs.includes(o)} onChange={() => toggle("orgs", o)}
                className="rounded border-[var(--border)] accent-blue-600 flex-shrink-0" />
              <span className="text-xs text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors leading-tight">{o}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Has Links">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={filters.hasDataset} onChange={e => setFilters({ ...filters, hasDataset: e.target.checked })}
            className="rounded border-[var(--border)] accent-blue-600" />
          <span className="text-sm text-[var(--foreground)]">Has Dataset Link</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={filters.hasYoutube} onChange={e => setFilters({ ...filters, hasYoutube: e.target.checked })}
            className="rounded border-[var(--border)] accent-blue-600" />
          <span className="text-sm text-[var(--foreground)]">Has YouTube Link</span>
        </label>
      </FilterSection>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
        {title}<ChevronDown size={13} className={`transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  );
}

// ─── Problems Page ────────────────────────────────────────────────────────────
function ProblemsPage({ search, bookmarks, onBookmark, onSelect, compareIds, onCompareToggle, initialTheme, initialOrg }: {
  search: string; bookmarks: Set<number>; onBookmark: (id: number) => void;
  onSelect: (p: Problem) => void; compareIds: Set<number>; onCompareToggle: (id: number) => void;
  initialTheme?: string; initialOrg?: string;
}) {
  const [view, setView] = useState<ViewMode>("grid");
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
  });

  useEffect(() => {
    if (initialTheme) setFilters(f => ({ ...f, themes: [initialTheme] }));
    if (initialOrg) setFilters(f => ({ ...f, orgs: [initialOrg] }));
  }, [initialTheme, initialOrg]);

  const filtered = useMemo(() => {
    let res = problems.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || [p.title, p.description, p.organization, p.department, p.theme, p.category, String(p.id)]
        .some(v => v.toLowerCase().includes(q));
      const matchOrg = !filters.orgs.length || filters.orgs.includes(p.organization);
      const matchTheme = !filters.themes.length || filters.themes.includes(p.theme);
      const matchCat = !filters.cats.length || filters.cats.includes(p.category);
      const matchDataset = !filters.hasDataset || !!p.datasetLinks;
      const matchYoutube = !filters.hasYoutube || !!p.youtubeLinks;
      return matchSearch && matchOrg && matchTheme && matchCat && matchDataset && matchYoutube;
    });
    res.sort((a, b) => {
      const va = sortKey === "id" ? a.id : String(a[sortKey as keyof Problem]);
      const vb = sortKey === "id" ? b.id : String(b[sortKey as keyof Problem]);
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortAsc ? cmp : -cmp;
    });
    return res;
  }, [search, filters, sortKey, sortAsc]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  useEffect(() => setPage(1), [search, filters, view, sortKey, sortAsc]);

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
            {[["id", "Problem ID"], ["title", "Title"], ["organization", "Organization"], ["theme", "Theme"], ["category", "Category"]].map(([v, l]) => (
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
              <ProblemCard key={p.id} p={p} bookmarks={bookmarks} onBookmark={onBookmark}
                onSelect={onSelect} compareIds={compareIds} onCompareToggle={onCompareToggle} />
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
                    <tr key={p.id} onClick={() => onSelect(p)}
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
              <CompactRow key={p.id} p={p} bookmarks={bookmarks} onBookmark={onBookmark} onSelect={onSelect} />
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

// ─── Dashboard ────────────────────────────────────────────────────────────────
const CHART_COLORS = ["#2563EB", "#7C3AED", "#22C55E", "#F59E0B", "#EC4899", "#14B8A6", "#EF4444", "#F97316", "#6366F1", "#8B5CF6"];

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-[var(--foreground)]">{value}</p>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function Dashboard({ onNavigate }: { onNavigate: (page: Page, filter?: string) => void }) {
  const themeData = useMemo(() => {
    const counts: Record<string, number> = {};
    problems.forEach(p => { counts[p.theme] = (counts[p.theme] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 20) + "…" : name, value, full: name }));
  }, []);

  const orgData = useMemo(() => {
    const counts: Record<string, number> = {};
    problems.forEach(p => { counts[p.organization] = (counts[p.organization] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({
      name: name.length > 18 ? name.slice(0, 18) + "…" : name, value, full: name
    }));
  }, []);

  const catData = useMemo(() => {
    const counts: Record<string, number> = {};
    problems.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  const topOrg = orgData[0]?.full || "";
  const softwareCount = problems.filter(p => p.category === "Software").length;
  const hardwareCount = problems.filter(p => p.category === "Hardware").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Smart India Hackathon 2025 — Problem Statement Overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Problems" value={problems.length} icon={<FileText size={20} className="text-blue-600" />} color="bg-blue-50 dark:bg-blue-900/20" />
        <StatCard label="Organizations" value={organizations.length} icon={<Building2 size={20} className="text-purple-600" />} color="bg-purple-50 dark:bg-purple-900/20" />
        <StatCard label="Departments" value={departments.length} icon={<GraduationCap size={20} className="text-green-600" />} color="bg-green-50 dark:bg-green-900/20" />
        <StatCard label="Themes" value={themes.length} icon={<Tag size={20} className="text-amber-600" />} color="bg-amber-50 dark:bg-amber-900/20" />
        <StatCard label="Software" value={softwareCount} icon={<Zap size={20} className="text-teal-600" />} color="bg-teal-50 dark:bg-teal-900/20" />
        <StatCard label="Hardware" value={hardwareCount} icon={<Hash size={20} className="text-orange-600" />} color="bg-orange-50 dark:bg-orange-900/20" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <BarChart3 size={15} className="text-[var(--primary)]" />Problems by Theme (Top 10)
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={themeData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                formatter={(v, _, p) => [v, p.payload.full]} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {themeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-[var(--primary)]" />Top Organizations
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={orgData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                formatter={(v, _, p) => [v, p.payload.full]} />
              <Bar dataKey="value" fill="#7C3AED" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Software vs Hardware</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {catData.map((_, i) => <Cell key={i} fill={i === 0 ? "#2563EB" : "#F97316"} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Highlights</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--muted)]">
              <span className="text-sm text-[var(--muted-foreground)]">Most Active Organization</span>
              <button onClick={() => onNavigate("organizations")}
                className="text-sm font-medium text-[var(--primary)] hover:underline truncate max-w-[200px]">{topOrg}</button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--muted)]">
              <span className="text-sm text-[var(--muted-foreground)]">Most Popular Theme</span>
              <button onClick={() => onNavigate("themes")}
                className="text-sm font-medium text-[var(--primary)] hover:underline truncate max-w-[200px]">{themeData[0]?.full}</button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--muted)]">
              <span className="text-sm text-[var(--muted-foreground)]">With Dataset Links</span>
              <span className="text-sm font-medium text-[var(--foreground)]">{problems.filter(p => p.datasetLinks).length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--muted)]">
              <span className="text-sm text-[var(--muted-foreground)]">With YouTube Links</span>
              <span className="text-sm font-medium text-[var(--foreground)]">{problems.filter(p => p.youtubeLinks).length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Organizations Page ───────────────────────────────────────────────────────
function OrgsPage({ onNavigate }: { onNavigate: (page: Page, filter?: string) => void }) {
  const orgStats = useMemo(() => {
    return organizations.map(org => {
      const ps = problems.filter(p => p.organization === org);
      const ts = [...new Set(ps.map(p => p.theme))];
      const ds = [...new Set(ps.map(p => p.department).filter(Boolean))];
      return { org, count: ps.length, themes: ts, depts: ds };
    }).sort((a, b) => b.count - a.count);
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Organizations</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{organizations.length} organizations with active problem statements</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {orgStats.map(({ org, count, themes: ts, depts }) => (
          <div key={org} className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <Building2 size={18} className="text-[var(--primary)]" />
              </div>
              <span className="text-2xl font-bold text-[var(--foreground)]">{count}</span>
            </div>
            <h3 className="font-semibold text-[var(--foreground)] text-sm leading-snug mb-3">{org}</h3>
            <div className="space-y-2 mb-4">
              <p className="text-xs text-[var(--muted-foreground)]">{depts.length} dept{depts.length !== 1 ? "s" : ""} · {ts.length} theme{ts.length !== 1 ? "s" : ""}</p>
              <div className="flex flex-wrap gap-1">
                {ts.slice(0, 3).map(t => <ThemeBadge key={t} theme={t} />)}
                {ts.length > 3 && <Badge label={`+${ts.length - 3}`} cls="bg-[var(--muted)] text-[var(--muted-foreground)]" />}
              </div>
            </div>
            <button onClick={() => onNavigate("problems", org)}
              className="w-full py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:opacity-90 transition-opacity">
              View {count} Problems
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Themes Page ─────────────────────────────────────────────────────────────
function ThemesPage({ onNavigate }: { onNavigate: (page: Page, filter?: string) => void }) {
  const themeStats = useMemo(() => {
    return themes.map(theme => {
      const ps = problems.filter(p => p.theme === theme);
      const orgs = [...new Set(ps.map(p => p.organization))];
      const sw = ps.filter(p => p.category === "Software").length;
      const hw = ps.filter(p => p.category === "Hardware").length;
      return { theme, count: ps.length, orgs, sw, hw };
    }).sort((a, b) => b.count - a.count);
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Themes</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{themes.length} themes across all problem statements</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {themeStats.map(({ theme, count, orgs, sw, hw }) => {
          const color = themeColors[theme] || "#94A3B8";
          return (
            <div key={theme} className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-xl" style={{ background: color + "20" }}>
                  <Layers size={18} style={{ color }} />
                </div>
                <span className="text-2xl font-bold text-[var(--foreground)]">{count}</span>
              </div>
              <h3 className="font-semibold text-[var(--foreground)] text-sm leading-snug mb-3">{theme}</h3>
              <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] mb-4">
                <span>{orgs.length} orgs</span>
                <span className="text-blue-500">{sw} SW</span>
                <span className="text-orange-500">{hw} HW</span>
              </div>
              <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden mb-4">
                <div className="h-full rounded-full" style={{ width: `${(count / problems.length) * 100}%`, background: color }} />
              </div>
              <button onClick={() => onNavigate("problems", theme)}
                className="w-full py-1.5 rounded-lg text-white text-xs font-medium hover:opacity-90 transition-opacity"
                style={{ background: color }}>
                Explore {count} Problems
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Departments Page ─────────────────────────────────────────────────────────
function DepsPage() {
  const deptStats = useMemo(() => {
    return departments.map(dept => {
      const ps = problems.filter(p => p.department === dept);
      const ts = [...new Set(ps.map(p => p.theme))];
      return { dept, count: ps.length, themes: ts };
    }).sort((a, b) => b.count - a.count);
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Departments</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{departments.length} departments across all problem statements</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {deptStats.map(({ dept, count, themes: ts }) => (
          <div key={dept} className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-900/20">
                <GraduationCap size={18} className="text-teal-600" />
              </div>
              <span className="text-xl font-bold text-[var(--foreground)]">{count}</span>
            </div>
            <h3 className="font-semibold text-[var(--foreground)] text-sm leading-snug mb-2">{dept}</h3>
            <div className="flex flex-wrap gap-1 mt-2">
              {ts.slice(0, 2).map(t => <ThemeBadge key={t} theme={t} />)}
              {ts.length > 2 && <Badge label={`+${ts.length - 2} more`} cls="bg-[var(--muted)] text-[var(--muted-foreground)]" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Favorites Page ────────────────────────────────────────────────────────────
function FavoritesPage({ bookmarks, onBookmark, onSelect, compareIds, onCompareToggle }: {
  bookmarks: Set<number>; onBookmark: (id: number) => void;
  onSelect: (p: Problem) => void; compareIds: Set<number>; onCompareToggle: (id: number) => void;
}) {
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
          <ProblemCard key={p.id} p={p} bookmarks={bookmarks} onBookmark={onBookmark}
            onSelect={onSelect} compareIds={compareIds} onCompareToggle={onCompareToggle} />
        ))}
      </div>
    </div>
  );
}

// ─── Compare Page ─────────────────────────────────────────────────────────────
function ComparePage({ compareIds, onRemove, onSelect, onGoToProblems }: {
  compareIds: Set<number>; onRemove: (id: number) => void;
  onSelect: (p: Problem) => void; onGoToProblems: () => void;
}) {
  const selected = problems.filter(p => compareIds.has(p.id));
  if (!selected.length) return (
    <div className="text-center py-24">
      <GitCompare size={48} className="text-[var(--muted-foreground)] mx-auto mb-4 opacity-30" />
      <p className="text-lg font-medium text-[var(--foreground)]">No problems selected for comparison</p>
      <p className="text-sm text-[var(--muted-foreground)] mt-1 mb-6">Use the compare button on problem cards to add up to 4</p>
      <button onClick={onGoToProblems}
        className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
        Browse Problems
      </button>
    </div>
  );

  const rows = [
    { key: "id", label: "Problem ID", render: (p: Problem) => <span className="font-mono text-[var(--primary)] font-semibold">#{p.id}</span> },
    { key: "title", label: "Title", render: (p: Problem) => <span className="font-medium text-sm">{p.title}</span> },
    { key: "organization", label: "Organization", render: (p: Problem) => p.organization },
    { key: "department", label: "Department", render: (p: Problem) => p.department || "—" },
    { key: "theme", label: "Theme", render: (p: Problem) => <ThemeBadge theme={p.theme} /> },
    { key: "category", label: "Category", render: (p: Problem) => <CatBadge cat={p.category} /> },
    { key: "description", label: "Description", render: (p: Problem) => <span className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-4">{p.description}</span> },
    { key: "dataset", label: "Dataset", render: (p: Problem) => p.datasetLinks ? <Database size={16} className="text-[var(--primary)]" /> : <span className="text-[var(--muted-foreground)]">—</span> },
    { key: "youtube", label: "YouTube", render: (p: Problem) => p.youtubeLinks ? <Play size={16} className="text-red-500" /> : <span className="text-[var(--muted-foreground)]">—</span> },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Compare</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Comparing {selected.length} problem statement{selected.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={onGoToProblems} className="text-sm text-[var(--primary)] hover:underline">+ Add more</button>
      </div>
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider w-28">Field</th>
              {selected.map(p => (
                <th key={p.id} className="px-5 py-3 text-left min-w-[200px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-[var(--primary)]">#{p.id}</span>
                    <button onClick={() => onRemove(p.id)}
                      className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ key, label, render }) => (
              <tr key={key} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/50 transition-colors">
                <td className="px-5 py-4 text-xs font-semibold text-[var(--muted-foreground)] align-top">{label}</td>
                {selected.map(p => (
                  <td key={p.id} className="px-5 py-4 text-sm text-[var(--foreground)] align-top cursor-pointer"
                    onClick={() => onSelect(p)}>
                    {render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Settings Page ─────────────────────────────────────────────────────────────
function SettingsPage({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  const exportCSV = () => {
    const headers = ["Problem ID", "Title", "Organization", "Department", "Theme", "Category", "Dataset Links", "YouTube Links"];
    const rows = problems.map(p => [p.id, p.title, p.organization, p.department, p.theme, p.category, p.datasetLinks, p.youtubeLinks]
      .map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "sih-2025-problems.csv";
    a.click();
  };

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
      </div>
      <div className="space-y-4">
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Dark Mode</p>
              <p className="text-xs text-[var(--muted-foreground)]">Switch between light and dark theme</p>
            </div>
            <button onClick={() => setDark(!dark)}
              className={`relative w-12 h-6 rounded-full transition-colors ${dark ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${dark ? "translate-x-6" : ""}`} />
            </button>
          </div>
        </div>
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Data</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Export Data</p>
              <p className="text-xs text-[var(--muted-foreground)]">Download all {problems.length} problems as CSV</p>
            </div>
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
              <Upload size={14} />Export CSV
            </button>
          </div>
        </div>
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5">
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-2">About</h2>
          <p className="text-sm text-[var(--muted-foreground)]">SIH 2025 Problem Explorer — {problems.length} problem statements from Smart India Hackathon 2025. Built for students, mentors, faculty, and hackathon teams.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV_ITEMS: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={17} /> },
  { page: "problems", label: "All Problems", icon: <BookOpen size={17} /> },
  { page: "organizations", label: "Organizations", icon: <Building2 size={17} /> },
  { page: "themes", label: "Themes", icon: <Layers size={17} /> },
  { page: "departments", label: "Departments", icon: <GraduationCap size={17} /> },
  { page: "favorites", label: "Favorites", icon: <Star size={17} /> },
  { page: "compare", label: "Compare", icon: <GitCompare size={17} /> },
  { page: "settings", label: "Settings", icon: <Settings size={17} /> },
];

function Sidebar({ page, onNavigate, collapsed, bookmarks, compareIds }: {
  page: Page; onNavigate: (p: Page) => void; collapsed: boolean;
  bookmarks: Set<number>; compareIds: Set<number>;
}) {
  return (
    <aside className={`flex flex-col bg-[var(--card)] border-r border-[var(--border)] transition-all duration-300
      ${collapsed ? "w-14" : "w-60"} flex-shrink-0 h-full`}>
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-[var(--border)] ${collapsed ? "justify-center" : ""}`}>
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">S</span>
        </div>
        {!collapsed && <span className="font-bold text-[var(--foreground)] text-sm">SIH Explorer</span>}
      </div>
      <nav className="flex-1 p-2 space-y-0.5">
        {NAV_ITEMS.map(({ page: p, label, icon }) => {
          const badge = p === "favorites" && bookmarks.size > 0 ? bookmarks.size : p === "compare" && compareIds.size > 0 ? compareIds.size : null;
          return (
            <button key={p} onClick={() => onNavigate(p)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors
                ${page === p ? "bg-blue-50 text-[var(--primary)] dark:bg-blue-900/20" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"}
                ${collapsed ? "justify-center" : ""}`}>
              <span className="flex-shrink-0">{icon}</span>
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{label}</span>
                  {badge && <span className="bg-[var(--primary)] text-white text-xs px-1.5 py-0.5 rounded-full">{badge}</span>}
                </>
              )}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[var(--border)]">
        {!collapsed && (
          <div className="text-xs text-[var(--muted-foreground)] text-center">
            {problems.length} problems · SIH 2025
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useDarkMode();
  const [bookmarks, onBookmark] = useBookmarks();
  const [page, setPage] = useState<Page>("dashboard");
  const [search, setSearch] = useState("");
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [compareIds, setCompareIds] = useState<Set<number>>(new Set());
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterCtx, setFilterCtx] = useState<{ theme?: string; org?: string }>({});
  const searchRef = useRef<HTMLInputElement>(null);

  const toggleCompare = (id: number) => setCompareIds(prev => {
    const next = new Set(prev);
    if (next.has(id)) { next.delete(id); return next; }
    if (next.size >= 4) return prev;
    next.add(id);
    return next;
  });

  const navigate = (p: Page, filter?: string) => {
    if (p === "problems" && filter) {
      const isTheme = themes.includes(filter);
      setFilterCtx(isTheme ? { theme: filter } : { org: filter });
    } else {
      setFilterCtx({});
    }
    setPage(p);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar page={page} onNavigate={navigate} collapsed={collapsed} bookmarks={bookmarks} compareIds={compareIds} />
      </div>

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 left-0 h-full w-60">
            <Sidebar page={page} onNavigate={navigate} collapsed={false} bookmarks={bookmarks} compareIds={compareIds} />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <header className="bg-[var(--card)] border-b border-[var(--border)] px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors">
            <Menu size={18} className="text-[var(--muted-foreground)]" />
          </button>
          <button onClick={() => setCollapsed(c => !c)} className="hidden md:flex p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors">
            <Menu size={18} className="text-[var(--muted-foreground)]" />
          </button>

          <div className="flex-1 relative max-w-xl">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by ID, title, organization, theme…"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-blue-500/20 transition-all"
              onFocus={() => { if (page !== "problems") navigate("problems"); }} />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={13} className="text-[var(--muted-foreground)]" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 ml-auto">
            {compareIds.size > 0 && (
              <button onClick={() => navigate("compare")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:opacity-90 transition-opacity">
                <GitCompare size={13} />Compare ({compareIds.size})
              </button>
            )}
            <button onClick={() => setDark(d => !d)}
              className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors">
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors">
              <Bell size={17} />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ml-1">
              <User size={14} className="text-white" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6">
          {page === "dashboard" && <Dashboard onNavigate={navigate} />}
          {page === "problems" && (
            <ProblemsPage
              search={search} bookmarks={bookmarks} onBookmark={onBookmark}
              onSelect={setSelectedProblem} compareIds={compareIds} onCompareToggle={toggleCompare}
              initialTheme={filterCtx.theme} initialOrg={filterCtx.org}
            />
          )}
          {page === "organizations" && <OrgsPage onNavigate={navigate} />}
          {page === "themes" && <ThemesPage onNavigate={navigate} />}
          {page === "departments" && <DepsPage />}
          {page === "favorites" && (
            <FavoritesPage bookmarks={bookmarks} onBookmark={onBookmark}
              onSelect={setSelectedProblem} compareIds={compareIds} onCompareToggle={toggleCompare} />
          )}
          {page === "compare" && (
            <ComparePage compareIds={compareIds} onRemove={toggleCompare}
              onSelect={setSelectedProblem} onGoToProblems={() => navigate("problems")} />
          )}
          {page === "settings" && <SettingsPage dark={dark} setDark={setDark} />}
        </main>
      </div>

      <DetailDrawer problem={selectedProblem} onClose={() => setSelectedProblem(null)}
        bookmarks={bookmarks} onBookmark={onBookmark} />
    </div>
  );
}
