import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBadge() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors relative"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--card)]"></span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[400px]">
          <div className="px-4 py-3 border-b border-[var(--border)] flex justify-between items-center bg-[var(--muted)]/50">
            <h3 className="font-semibold text-sm text-[var(--foreground)]">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-[var(--primary)] hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-[var(--muted-foreground)] text-sm">
                No notifications yet.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {notifications.map(notification => (
                  <div 
                    key={notification._id} 
                    className={`p-4 flex gap-3 hover:bg-[var(--muted)]/50 transition-colors ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                    onClick={() => {
                      if (!notification.read) markAsRead(notification._id);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm text-[var(--foreground)] ${!notification.read ? 'font-semibold' : ''}`}>
                        {notification.message}
                      </p>
                      <span className="text-xs text-[var(--muted-foreground)] mt-1 block">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    {notification.link && (
                      <Link to={notification.link} className="p-1.5 h-fit rounded-lg bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-white text-[var(--muted-foreground)] transition-colors">
                        <ExternalLink size={14} />
                      </Link>
                    )}
                    {!notification.read && !notification.link && (
                      <button onClick={() => markAsRead(notification._id)} className="p-1.5 h-fit rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Mark as read">
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-[var(--border)] bg-[var(--muted)]/30 text-center">
            <Link to="/notifications" onClick={() => setOpen(false)} className="text-xs font-semibold text-[var(--primary)] hover:underline">
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
