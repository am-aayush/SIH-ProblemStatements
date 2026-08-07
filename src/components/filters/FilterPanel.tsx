import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { themes, organizations } from "../../data/problems";
import { FilterSection } from "./FilterSection";

export function FilterPanel({ filters, setFilters, onClose }: {
  filters: { orgs: string[]; themes: string[]; cats: string[]; hasDataset: boolean; hasYoutube: boolean; stages: string[] };
  setFilters: (f: typeof filters) => void; onClose?: () => void;
}) {
  const toggle = (key: "orgs" | "themes" | "cats" | "stages", val: string) => {
    const arr = filters[key];
    setFilters({ ...filters, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] });
  };
  const reset = () => setFilters({ orgs: [], themes: [], cats: [], hasDataset: false, hasYoutube: false, stages: [] });
  const activeCount = filters.orgs.length + filters.themes.length + filters.cats.length + filters.stages.length + (filters.hasDataset ? 1 : 0) + (filters.hasYoutube ? 1 : 0);

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

      <FilterSection title="Research Stage">
        {["Available", "Bookmarked", "Researching", "Voting", "Shortlisted", "Final Selected"].map(stage => (
          <label key={stage} className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" checked={filters.stages.includes(stage)} onChange={() => toggle("stages", stage)}
              className="rounded border-[var(--border)] accent-blue-600" />
            <span className="text-sm text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{stage}</span>
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
