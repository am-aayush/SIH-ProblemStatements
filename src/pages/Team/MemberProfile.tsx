import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User as UserIcon, Mail, BookOpen, MapPin, Globe, Briefcase, Code, Loader2, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function MemberProfile() {
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await api.get(`/users/${id}`);
        setMember(res.data);
      } catch (err) {
        toast.error('Failed to load member profile');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchMember();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={32} className="animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--muted-foreground)]">Member not found.</p>
        <Link to="/team" className="text-[var(--primary)] hover:underline mt-4 inline-block">Back to Team</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/team" className="p-2 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:bg-[var(--muted)] transition-colors text-[var(--foreground)]">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Member Profile</h1>
      </div>

      {/* Header Profile Section */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--background)] shadow-lg bg-gradient-to-br from-[var(--primary)] to-purple-600 flex shrink-0 items-center justify-center">
          {member.avatar ? (
            <img src={member.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl text-white font-bold">{member.fullName?.charAt(0)}</span>
          )}
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <h2 className="text-3xl font-bold text-[var(--foreground)]">{member.fullName}</h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[var(--muted-foreground)] text-sm">
            <span className="flex items-center gap-1.5"><Mail size={16} /> {member.email}</span>
            <span className="flex items-center gap-1.5">
              <UserIcon size={16} /> 
              {member.role}
            </span>
          </div>
          
          <div className="pt-4 flex flex-wrap gap-3 justify-center md:justify-start">
            {member.profile?.socialLinks?.github && (
              <a href={member.profile.socialLinks.github} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-[var(--muted)] text-[var(--foreground)] hover:text-white hover:bg-[#333] transition-colors flex items-center gap-2 text-sm font-medium">
                <Code size={18} /> GitHub
              </a>
            )}
            {member.profile?.socialLinks?.linkedin && (
              <a href={member.profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-[var(--muted)] text-[var(--foreground)] hover:text-white hover:bg-[#0077b5] transition-colors flex items-center gap-2 text-sm font-medium">
                <Briefcase size={18} /> LinkedIn
              </a>
            )}
            {member.profile?.socialLinks?.portfolio && (
              <a href={member.profile.socialLinks.portfolio} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-[var(--muted)] text-[var(--foreground)] hover:text-white hover:bg-[var(--primary)] transition-colors flex items-center gap-2 text-sm font-medium">
                <Globe size={18} /> Portfolio
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-[var(--primary)]" /> Education
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">College/University</p>
                <p className="font-medium text-[var(--foreground)]">{member.profile?.college || 'Not specified'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Branch</p>
                  <p className="font-medium text-[var(--foreground)]">{member.profile?.branch || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Year</p>
                  <p className="font-medium text-[var(--foreground)]">{member.profile?.year || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Briefcase size={20} className="text-[var(--primary)]" /> Professional
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Experience Level</p>
                <p className="font-medium text-[var(--foreground)]">{member.experienceLevel || 'Beginner'}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Preferred Domain</p>
                <p className="font-medium text-[var(--foreground)]">{member.profile?.preferredDomain || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <UserIcon size={20} className="text-[var(--primary)]" /> Bio
            </h3>
            <p className="text-[var(--foreground)] whitespace-pre-line leading-relaxed">
              {member.profile?.bio || 'This member has not written a bio yet.'}
            </p>
          </div>

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Code size={20} className="text-[var(--primary)]" /> Skills & Tech Stack
            </h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)] mb-3">Primary Skills</p>
                <div className="flex flex-wrap gap-2">
                  {member.primarySkills?.length ? member.primarySkills.map((skill: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-sm font-medium">
                      {skill}
                    </span>
                  )) : (
                    <span className="text-sm text-[var(--muted-foreground)] italic">No primary skills listed</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-[var(--foreground)] mb-3">Secondary Skills</p>
                <div className="flex flex-wrap gap-2">
                  {member.secondarySkills?.length ? member.secondarySkills.map((skill: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-[var(--muted)] text-[var(--foreground)] rounded-lg text-sm font-medium border border-[var(--border)]">
                      {skill}
                    </span>
                  )) : (
                    <span className="text-sm text-[var(--muted-foreground)] italic">No secondary skills listed</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
