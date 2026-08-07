import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { organizations, problems } from "../../data/problems";
import { ThemeBadge } from "../../components/common/ThemeBadge";
import { Badge } from "../../components/common/Badge";

export default function OrgsPage() {
  const navigate = useNavigate();
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
            <button onClick={() => navigate("/problems", { state: { org } })}
              className="w-full py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:opacity-90 transition-opacity">
              View {count} Problems
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
