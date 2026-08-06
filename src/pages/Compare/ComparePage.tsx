import React from "react";
import { useNavigate } from "react-router-dom";
import { GitCompare, X, Database, Play } from "lucide-react";
import { problems } from "../../data/problems";
import { ThemeBadge } from "../../components/common/ThemeBadge";
import { CatBadge } from "../../components/common/CatBadge";
import { useAppContext } from "../../context/AppContext";
import { Problem } from "../../types";

export default function ComparePage() {
  const { compareIds, toggleCompare, setSelectedProblem } = useAppContext();
  const navigate = useNavigate();
  const selected = problems.filter(p => compareIds.has(p.id));

  if (!selected.length) return (
    <div className="text-center py-24">
      <GitCompare size={48} className="text-[var(--muted-foreground)] mx-auto mb-4 opacity-30" />
      <p className="text-lg font-medium text-[var(--foreground)]">No problems selected for comparison</p>
      <p className="text-sm text-[var(--muted-foreground)] mt-1 mb-6">Use the compare button on problem cards to add up to 4</p>
      <button onClick={() => navigate("/problems")}
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
        <button onClick={() => navigate("/problems")} className="text-sm text-[var(--primary)] hover:underline">+ Add more</button>
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
                    <button onClick={() => toggleCompare(p.id)}
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
                    onClick={() => setSelectedProblem(p)}>
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
