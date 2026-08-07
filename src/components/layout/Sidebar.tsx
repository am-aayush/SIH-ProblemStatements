import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, BookOpen, Building2, Layers, GraduationCap, Star, GitCompare, Settings, Users, UserCircle, Activity, LogOut, Kanban, MessageSquare, Calendar as CalendarIcon, Flag, Folder, PieChart, Lightbulb } from "lucide-react";
import { problems } from "../../data/problems";
import { useAppContext } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: <LayoutDashboard size={17} />, page: "dashboard" },
  { path: "/problems", label: "All Problems", icon: <BookOpen size={17} />, page: "problems" },
  { path: "/custom-problems", label: "Custom Problems", icon: <Lightbulb size={17} />, page: "custom-problems" },
  { path: "/organizations", label: "Organizations", icon: <Building2 size={17} />, page: "organizations" },
  { path: "/themes", label: "Themes", icon: <Layers size={17} />, page: "themes" },
  { path: "/departments", label: "Departments", icon: <GraduationCap size={17} />, page: "departments" },
  { path: "/favorites", label: "Favorites", icon: <Star size={17} />, page: "favorites" },
  { path: "/compare", label: "Compare", icon: <GitCompare size={17} />, page: "compare" },
  { path: "/team", label: "Team", icon: <Users size={17} />, page: "team" },
  { path: "/skill-matrix", label: "Skill Matrix", icon: <Layers size={17} />, page: "skill-matrix" },
  { path: "/progress", label: "Progress", icon: <Activity size={17} />, page: "progress" },
  { path: "/tasks", label: "Tasks", icon: <Kanban size={17} />, page: "tasks" },
  { path: "/standup", label: "Daily Standup", icon: <MessageSquare size={17} />, page: "standup" },
  { path: "/meetings", label: "Meetings", icon: <CalendarIcon size={17} />, page: "meetings" },
  { path: "/submission", label: "Submission Tracker", icon: <Flag size={17} />, page: "submission" },
  { path: "/project/files", label: "Files", icon: <Folder size={17} />, page: "files" },
  { path: "/analytics", label: "Analytics", icon: <PieChart size={17} />, page: "analytics" },
  { path: "/profile", label: "Profile", icon: <UserCircle size={17} />, page: "profile" },
  { path: "/settings", label: "Settings", icon: <Settings size={17} />, page: "settings" },
];

export function Sidebar({ collapsed, setMobileMenuOpen }: { collapsed: boolean; setMobileMenuOpen?: (v: boolean) => void }) {
  const { bookmarks, compareIds } = useAppContext();
  const { logout } = useAuth();
  return (
    <aside className={`flex flex-col bg-(--card) border-r border-(--border) transition-all duration-300
      ${collapsed ? "w-14" : "w-60"} shrink-0 h-full`}>
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-(--border) ${collapsed ? "justify-center" : ""}`}>
        <div className="w-7 h-7 rounded-lg bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">S</span>
        </div>
        {!collapsed && <span className="font-bold text-(--foreground) text-sm">SIH Explorer</span>}
      </div>
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-scroll scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-(--muted)">
        {NAV_ITEMS.map(({ path, label, icon, page }) => {
          const badge = page === "favorites" && bookmarks.size > 0 ? bookmarks.size : page === "compare" && compareIds.size > 0 ? compareIds.size : null;
          return (
            <NavLink key={path} to={path} onClick={() => setMobileMenuOpen?.(false)}
              className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors
                ${isActive ? "bg-blue-50 text-(--primary) dark:bg-blue-900/20" : "text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"}
                ${collapsed ? "justify-center" : ""}`}>
              <span className="shrink-0">{icon}</span>
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{label}</span>
                  {badge && <span className="bg-(--primary) text-white text-xs px-1.5 py-0.5 rounded-full">{badge}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-(--border)">
        <button onClick={logout} className="md:hidden w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mb-2">
          <LogOut size={17} />
          {!collapsed && <span>Logout</span>}
        </button>
        {!collapsed && (
          <div className="text-xs text-(--muted-foreground) text-center">
            {problems.length} problems · SIH 2025
          </div>
        )}
      </div>
    </aside>
  );
}
