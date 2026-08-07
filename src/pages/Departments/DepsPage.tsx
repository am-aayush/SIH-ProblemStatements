import React, { useMemo } from "react";
import { GraduationCap } from "lucide-react";
import { departments, problems } from "../../data/problems";
import { ThemeBadge } from "../../components/common/ThemeBadge";
import { Badge } from "../../components/common/Badge";

export default function DepsPage() {
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
