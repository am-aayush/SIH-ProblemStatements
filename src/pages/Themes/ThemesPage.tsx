import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Layers } from "lucide-react";
import { themes, problems } from "../../data/problems";
import { THEME_BG } from "../../constants";

export default function ThemesPage() {
  const navigate = useNavigate();
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
          const bg = THEME_BG[theme] || "bg-slate-100 text-slate-700";
          const colorMatch = bg.match(/text-([a-z]+)-/);
          const color = colorMatch ? `var(--color-${colorMatch[1]}-500, #3B82F6)` : "#3B82F6";
          
          return (
            <div key={theme} className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl ${bg.split(" ")[0]} ${bg.split(" ")[1]}`}>
                  <Layers size={18} />
                </div>
                <span className="text-xl font-bold text-[var(--foreground)]">{count}</span>
              </div>
              <h3 className="font-semibold text-[var(--foreground)] text-sm leading-snug mb-3">{theme}</h3>
              <div className="space-y-1 mb-4">
                <p className="text-xs text-[var(--muted-foreground)]">{orgs.length} organization{orgs.length !== 1 ? "s" : ""}</p>
                <div className="flex gap-3 text-xs">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">{sw} Software</span>
                  <span className="text-orange-600 dark:text-orange-400 font-medium">{hw} Hardware</span>
                </div>
              </div>
              <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden mb-4">
                <div className="h-full rounded-full" style={{ width: `${(count / problems.length) * 100}%`, background: color }} />
              </div>
              <button onClick={() => navigate("/problems", { state: { theme } })}
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
