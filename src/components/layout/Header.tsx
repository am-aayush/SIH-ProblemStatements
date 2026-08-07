import React, { useRef, useState, useEffect } from "react";
import { Search, X, GitCompare, Sun, Moon, User, Menu, LogOut, UserCircle } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { NotificationBadge } from "../notifications/NotificationBadge";

export function Header({ setMobileMenuOpen, collapsed, setCollapsed }: {
  setMobileMenuOpen: (v: boolean) => void;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { search, setSearch, compareIds, dark, setDark } = useAppContext();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);
  
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="bg-[var(--card)] border-b border-[var(--border)] px-4 py-3 flex items-center gap-3 flex-shrink-0">
      <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors">
        <Menu size={18} className="text-[var(--muted-foreground)]" />
      </button>
      <button onClick={() => setCollapsed(c => !c)} className="hidden md:flex p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors">
        <Menu size={18} className="text-[var(--muted-foreground)]" />
      </button>

      <div className="flex-1 relative max-w-xl">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by ID, title, organization, theme…"
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-blue-500/20 transition-all"
          onFocus={() => { if (location.pathname !== "/problems") navigate("/problems"); }} />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X size={13} className="text-[var(--muted-foreground)]" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {compareIds.size > 0 && (
          <button onClick={() => navigate("/compare")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:opacity-90 transition-opacity">
            <GitCompare size={13} />Compare ({compareIds.size})
          </button>
        )}
        <button onClick={() => setDark(!dark)}
          className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors">
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <NotificationBadge />
        <div className="relative hidden md:block" ref={dropdownRef}>
          <button onClick={() => setProfileOpen(!profileOpen)} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ml-1 overflow-hidden hover:opacity-90 transition-opacity">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-xs font-bold">{user?.fullName?.charAt(0) || <User size={14} className="text-white" />}</span>
            )}
          </button>
          
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-[var(--border)]">
                <p className="text-sm font-semibold text-[var(--foreground)] truncate">{user?.fullName}</p>
                <p className="text-xs text-[var(--muted-foreground)] truncate">{user?.email}</p>
              </div>
              <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
                <UserCircle size={15} /> My Profile
              </Link>
              <button onClick={() => { setProfileOpen(false); logout(); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
        
        {/* Mobile profile link (logout is in sidebar) */}
        <Link to="/profile" className="md:hidden w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ml-1 overflow-hidden hover:opacity-90 transition-opacity">
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-xs font-bold">{user?.fullName?.charAt(0) || <User size={14} className="text-white" />}</span>
          )}
        </Link>
      </div>
    </header>
  );
}
