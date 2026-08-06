import { useState } from "react";

export function useBookmarks() {
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
