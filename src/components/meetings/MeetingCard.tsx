import React from 'react';
import { Meeting } from '../../types/meeting';
import { Calendar, Clock, Video, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export function MeetingCard({ meeting }: { meeting: Meeting }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <Link to={`/meetings/${meeting._id}`} className="block group">
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 hover:border-[var(--primary)] transition-colors shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusColor(meeting.status)}`}>
            {meeting.status}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <Users size={14} />
            <span>{meeting.attendees?.length || 0}</span>
          </div>
        </div>

        <h3 className="font-bold text-lg text-[var(--foreground)] mb-1 group-hover:text-[var(--primary)] transition-colors">{meeting.title}</h3>
        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-4">{meeting.description || 'No description provided.'}</p>

        <div className="space-y-2 text-sm text-[var(--muted-foreground)]">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-[var(--primary)]" />
            <span>{format(new Date(meeting.date), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[var(--primary)]" />
            <span>{meeting.startTime} - {meeting.endTime}</span>
          </div>
          <div className="flex items-center gap-2">
            {meeting.meetingType === 'Online' ? (
              <Video size={14} className="text-[var(--primary)]" />
            ) : (
              <MapPin size={14} className="text-[var(--primary)]" />
            )}
            <span className="truncate">{meeting.meetingType === 'Online' ? 'Online Meeting' : meeting.location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
