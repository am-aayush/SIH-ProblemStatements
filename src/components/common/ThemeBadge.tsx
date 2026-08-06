import { Badge } from "./Badge";
import { THEME_BG } from "../../constants";

export function ThemeBadge({ theme }: { theme: string }) {
  return <Badge label={theme} cls={THEME_BG[theme] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"} />;
}
