import { Badge } from "./Badge";

export function CatBadge({ cat }: { cat: string }) {
  return <Badge label={cat} cls={cat === "Software" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"} />;
}
