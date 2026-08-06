import React, { useState, Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { DetailDrawer } from "../dialogs/DetailDrawer";
import { useAppContext } from "../../context/AppContext";

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { selectedProblem, setSelectedProblem, bookmarks, toggleBookmark } = useAppContext();

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar collapsed={collapsed} />
      </div>

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 left-0 h-full w-60">
            <Sidebar collapsed={false} setMobileMenuOpen={setMobileMenuOpen} />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <Header setMobileMenuOpen={setMobileMenuOpen} collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6">
          <Suspense fallback={<div className="flex items-center justify-center h-full"><p className="text-[var(--muted-foreground)]">Loading...</p></div>}>
            <Outlet />
          </Suspense>
        </main>

        <footer className="bg-[var(--card)] border-t border-[var(--border)] px-4 py-3 text-xs text-[var(--muted-foreground)] text-center">
          Made With ❤️ By Aayush
        </footer>
      </div>

      <DetailDrawer problem={selectedProblem} onClose={() => setSelectedProblem(null)}
        bookmarks={bookmarks} onBookmark={toggleBookmark} />
    </div>
  );
}
