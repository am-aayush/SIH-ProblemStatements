import React from 'react';
import { SubmissionTrackerData } from '../../types/submission';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export function TeamReadiness({ tracker }: { tracker: SubmissionTrackerData }) {
  const getStageStatus = (stageNames: string[]) => {
    if (!tracker) return 'Pending';
    const stages = tracker.milestones.filter(m => stageNames.includes(m.name));
    if (stages.length === 0) return 'Pending';
    
    const allCompleted = stages.every(m => m.status === 'Completed');
    const anyInProgress = stages.some(m => m.status === 'In Progress' || m.progress > 0);
    
    if (allCompleted) return 'Completed';
    if (anyInProgress) return 'In Progress';
    return 'Pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'In Progress': return <Clock size={16} className="text-blue-500" />;
      default: return <Circle size={16} className="text-gray-400" />;
    }
  };

  const readinessAreas = [
    { label: 'Problem & Research', stages: ['Problem Finalized', 'Research Completed'] },
    { label: 'Design & Prototype', stages: ['Solution Design', 'Prototype Development'] },
    { label: 'Testing & Validation', stages: ['Testing'] },
    { label: 'Documentation & Pitch', stages: ['Documentation', 'PPT Preparation', 'Demo Video'] },
    { label: 'Final Submission', stages: ['Final Submission'] },
  ];

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5">
      <h3 className="font-bold text-[var(--foreground)] mb-4">Team Readiness</h3>
      
      <div className="space-y-4">
        {readinessAreas.map((area, idx) => {
          const status = getStageStatus(area.stages);
          return (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(status)}
                <span className="text-sm font-medium text-[var(--foreground)]">{area.label}</span>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                status === 'Completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                status === 'In Progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                'bg-gray-500/10 text-gray-500 border-gray-500/20'
              }`}>
                {status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
