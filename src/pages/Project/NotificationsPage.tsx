import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { format } from 'date-fns';
import { Check, CheckCircle2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotificationsPage() {
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Notifications</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">You have {unreadCount} unread notifications.</p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-white text-[var(--foreground)] px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <CheckCircle2 size={16} /> Mark all as read
          </button>
        )}
      </div>

      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div></div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-[var(--muted-foreground)]">
            No notifications found.
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {notifications.map(notification => (
              <div 
                key={notification._id} 
                className={`p-5 flex gap-4 transition-colors ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
              >
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${!notification.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                
                <div className="flex-1 min-w-0">
                  <p className={`text-[var(--foreground)] ${!notification.read ? 'font-semibold' : 'text-[var(--muted-foreground)]'}`}>
                    {notification.message}
                  </p>
                  <span className="text-xs text-[var(--muted-foreground)] mt-2 block">
                    {format(new Date(notification.createdAt), 'MMM d, yyyy • h:mm a')}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {notification.link && (
                    <Link 
                      to={notification.link} 
                      className="p-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-white text-[var(--muted-foreground)] transition-colors"
                      title="View details"
                    >
                      <ExternalLink size={16} />
                    </Link>
                  )}
                  {!notification.read && (
                    <button 
                      onClick={() => markAsRead(notification._id)} 
                      className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-blue-500/20" 
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
