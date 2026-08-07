import React, { useState, useEffect } from 'react';
import { Search, Filter, Layers, Code2, GraduationCap, MapPin, Target } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface MemberData {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  avatar?: string;
  primarySkills: string[];
  secondarySkills: string[];
  experienceLevel: string;
  profile?: {
    preferredDomain?: string;
    technologyStack?: string[];
  };
}

export default function SkillMatrix() {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [skillSearch, setSkillSearch] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [domainFilter, setDomainFilter] = useState('');

  useEffect(() => {
    fetchMatrix();
  }, [skillSearch, experienceFilter, domainFilter]);

  const fetchMatrix = async () => {
    try {
      const params = new URLSearchParams();
      if (skillSearch) params.append('skill', skillSearch);
      if (experienceFilter) params.append('experience', experienceFilter);
      if (domainFilter) params.append('domain', domainFilter);

      const res = await api.get(`/users/team/search?${params.toString()}`);
      setMembers(res.data);
    } catch (error) {
      toast.error('Failed to load skill matrix');
    } finally {
      setLoading(false);
    }
  };

  const allDomains = Array.from(new Set(members.flatMap(m => m.profile?.preferredDomain).filter(Boolean)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Team Skill Matrix</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Explore your team's collective capabilities and technical strengths</p>
      </div>

      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input 
            value={skillSearch}
            onChange={(e) => setSkillSearch(e.target.value)}
            placeholder="Search by skill..." 
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm outline-none focus:border-[var(--primary)]"
          />
        </div>
        
        <select 
          value={experienceFilter}
          onChange={(e) => setExperienceFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm outline-none focus:border-[var(--primary)] min-w-[150px]"
        >
          <option value="">All Experience</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Expert">Expert</option>
        </select>
        
        <select 
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-sm outline-none focus:border-[var(--primary)] min-w-[150px]"
        >
          <option value="">All Domains</option>
          {allDomains.map((domain, i) => (
            <option key={i} value={domain as string}>{domain}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map(member => (
          <div key={member._id} className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 hover:border-[var(--primary)]/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 overflow-hidden border-2 border-[var(--card)] shadow-sm">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold">{member.fullName.charAt(0)}</span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">{member.fullName}</h3>
                <span className="text-xs text-[var(--muted-foreground)]">{member.role}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Code2 size={14} className="text-[var(--primary)]" />
                  <span className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Primary Skills</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {member.primarySkills?.length ? member.primarySkills.map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded text-[10px] font-medium">{skill}</span>
                  )) : <span className="text-xs text-[var(--muted-foreground)] italic">Not specified</span>}
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Target size={14} className="text-orange-500" />
                  <span className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Preferred Domain</span>
                </div>
                <p className="text-sm font-medium text-[var(--foreground)]">{member.profile?.preferredDomain || 'Any'}</p>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex justify-between items-center">
                <span className="text-xs text-[var(--muted-foreground)]">Experience</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  member.experienceLevel === 'Expert' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  member.experienceLevel === 'Advanced' ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                  member.experienceLevel === 'Intermediate' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {member.experienceLevel || 'Beginner'}
                </span>
              </div>
            </div>
          </div>
        ))}

        {members.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-[var(--muted-foreground)]">
            No team members matched your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
