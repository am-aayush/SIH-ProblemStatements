import React, { createContext, useContext, useState, ReactNode } from "react";
import { Problem } from "../types";
import { useResearch } from "../hooks/useResearch";
import { useDarkMode } from "../hooks/useDarkMode";

interface AppContextType {
  dark: boolean;
  setDark: (v: boolean) => void;
  bookmarks: Set<number>;
  toggleBookmark: (id: number) => void;
  compareIds: Set<number>;
  toggleCompare: (id: number) => void;
  search: string;
  setSearch: (s: string) => void;
  selectedProblem: Problem | null;
  setSelectedProblem: (p: Problem | null) => void;
  research: ReturnType<typeof useResearch>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useDarkMode();
  const research = useResearch();
  const [compareIds, setCompareIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  const toggleCompare = (id: number) => setCompareIds(prev => {
    const next = new Set(prev);
    if (next.has(id)) { next.delete(id); return next; }
    if (next.size >= 4) return prev;
    next.add(id);
    return next;
  });

  return (
    <AppContext.Provider value={{
      dark, setDark,
      bookmarks: research.getBookmarks, toggleBookmark: research.toggleBookmark,
      compareIds, toggleCompare,
      search, setSearch,
      selectedProblem, setSelectedProblem,
      research
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
