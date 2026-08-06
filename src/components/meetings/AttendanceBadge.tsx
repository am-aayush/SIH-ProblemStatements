import React from 'react';
import { Check, X, HelpCircle, Clock } from 'lucide-react';

export function AttendanceBadge({ status }: { status: string }) {
  if (status === 'Present') {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium border border-green-500/20">
        <Check size={12} /> Present
      </span>
    );
  }
  if (status === 'Absent') {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-xs font-medium border border-red-500/20">
        <X size={12} /> Absent
      </span>
    );
  }
  if (status === 'Maybe') {
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium border border-yellow-500/20">
        <HelpCircle size={12} /> Maybe
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-500 text-xs font-medium border border-gray-500/20">
      <Clock size={12} /> Pending
    </span>
  );
}
