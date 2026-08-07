import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--card)] rounded-2xl border border-[var(--border)]">
      <div className="w-16 h-16 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] mb-6">
        <Icon size={32} />
      </div>
      <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--muted-foreground)] max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
