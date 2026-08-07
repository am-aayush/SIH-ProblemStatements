import React, { useState, useEffect } from 'react';
import { useAuth, User } from '../../context/AuthContext';
import { User as UserIcon, Mail, Shield, Building, Edit2, Check, X, Code, Briefcase, Globe, MapPin, GraduationCap, Hash, Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../../services/api';

const profileSchema = z.object({
  avatar: z.string().optional(),
  bio: z.string().max(500, "Bio is too long").optional(),
  college: z.string().max(100).optional(),
  branch: z.string().max(100).optional(),
  year: z.string().max(20).optional(),
  primarySkills: z.string().optional(),
  secondarySkills: z.string().optional(),
  preferredDomain: z.string().optional(),
  experienceLevel: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).optional(),
  technologyStack: z.string().optional(),
  github: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  linkedin: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  portfolio: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        avatar: user.avatar || '',
        bio: user.profile?.bio || '',
        college: user.profile?.college || '',
        branch: user.profile?.branch || '',
        year: user.profile?.year || '',
        primarySkills: user.primarySkills?.join(', ') || '',
        secondarySkills: user.secondarySkills?.join(', ') || '',
        preferredDomain: user.profile?.preferredDomain || '',
        experienceLevel: user.experienceLevel || 'Beginner',
        technologyStack: user.profile?.technologyStack?.join(', ') || '',
        github: user.profile?.socialLinks?.github || '',
        linkedin: user.profile?.socialLinks?.linkedin || '',
        portfolio: user.profile?.socialLinks?.portfolio || '',
      });
    }
  }, [user, reset]);

  if (!user) return null;

  const onSubmit = async (data: ProfileForm) => {
    try {
      setLoading(true);
      const payload = {
        avatar: data.avatar,
        primarySkills: data.primarySkills ? data.primarySkills.split(',').map(s => s.trim()).filter(Boolean) : [],
        secondarySkills: data.secondarySkills ? data.secondarySkills.split(',').map(s => s.trim()).filter(Boolean) : [],
        experienceLevel: data.experienceLevel,
        profile: {
          bio: data.bio,
          college: data.college,
          branch: data.branch,
          year: data.year,
          preferredDomain: data.preferredDomain,
          technologyStack: data.technologyStack ? data.technologyStack.split(',').map(s => s.trim()).filter(Boolean) : [],
          socialLinks: {
            github: data.github,
            linkedin: data.linkedin,
            portfolio: data.portfolio,
          }
        }
      };

      const res = await api.put(`/users/${user._id}/profile`, payload);
      // Update local storage context
      login(localStorage.getItem('token') || '', res.data);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Profile</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Manage your personal information and skills</p>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <Edit2 size={16} /> Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--muted)] text-[var(--foreground)] text-sm font-medium hover:bg-[var(--muted)]/80 transition-colors">
              <X size={16} /> Cancel
            </button>
            <button onClick={handleSubmit(onSubmit)} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-blue-600 to-purple-600"></div>
            <div className="px-6 pb-6 text-center">
              <div className="w-24 h-24 mx-auto rounded-full border-4 border-[var(--card)] bg-[var(--muted)] flex items-center justify-center -mt-12 overflow-hidden mb-4 relative group">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-[var(--muted-foreground)]">{user.fullName.charAt(0)}</span>
                )}
              </div>
              
              <h2 className="text-lg font-bold text-[var(--foreground)]">{user.fullName}</h2>
              <p className="text-sm text-[var(--muted-foreground)]">{user.email}</p>
              
              <div className="flex justify-center gap-2 mt-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                  {user.role}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800 flex items-center gap-1">
                  <Hash size={12} /> Team: {user.teamId.substring(0, 6)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Social Links */}
          <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6">
            <h3 className="text-sm font-bold text-[var(--foreground)] mb-4 uppercase tracking-wider text-[var(--muted-foreground)]">Social Links</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Code size={18} className="text-[var(--muted-foreground)]" />
                {isEditing ? (
                  <div className="w-full">
                    <input {...register('github')} placeholder="GitHub URL" className="w-full px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-sm" />
                    {errors.github && <p className="text-red-500 text-xs mt-1">{errors.github.message}</p>}
                  </div>
                ) : (
                  <a href={user.profile?.socialLinks?.github || '#'} target="_blank" rel="noreferrer" className="text-sm text-[var(--foreground)] hover:text-[var(--primary)] transition-colors truncate">
                    {user.profile?.socialLinks?.github || 'Not provided'}
                  </a>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Briefcase size={18} className="text-[var(--muted-foreground)]" />
                {isEditing ? (
                  <div className="w-full">
                    <input {...register('linkedin')} placeholder="LinkedIn URL" className="w-full px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-sm" />
                    {errors.linkedin && <p className="text-red-500 text-xs mt-1">{errors.linkedin.message}</p>}
                  </div>
                ) : (
                  <a href={user.profile?.socialLinks?.linkedin || '#'} target="_blank" rel="noreferrer" className="text-sm text-[var(--foreground)] hover:text-[var(--primary)] transition-colors truncate">
                    {user.profile?.socialLinks?.linkedin || 'Not provided'}
                  </a>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-[var(--muted-foreground)]" />
                {isEditing ? (
                  <div className="w-full">
                    <input {...register('portfolio')} placeholder="Portfolio URL" className="w-full px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-sm" />
                    {errors.portfolio && <p className="text-red-500 text-xs mt-1">{errors.portfolio.message}</p>}
                  </div>
                ) : (
                  <a href={user.profile?.socialLinks?.portfolio || '#'} target="_blank" rel="noreferrer" className="text-sm text-[var(--foreground)] hover:text-[var(--primary)] transition-colors truncate">
                    {user.profile?.socialLinks?.portfolio || 'Not provided'}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* About Me */}
          <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6">
            <h3 className="text-sm font-bold text-[var(--foreground)] mb-4 uppercase tracking-wider text-[var(--muted-foreground)]">About Me</h3>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Avatar URL</label>
                  <input {...register('avatar')} placeholder="https://example.com/avatar.jpg" className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Bio</label>
                  <textarea {...register('bio')} rows={3} placeholder="Tell us about yourself..." className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-sm resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">College/University</label>
                    <input {...register('college')} placeholder="e.g. MIT" className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Branch/Major</label>
                    <input {...register('branch')} placeholder="e.g. Computer Science" className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Year of Study</label>
                    <input {...register('year')} placeholder="e.g. 3rd Year" className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-sm" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm text-[var(--foreground)] leading-relaxed">
                  {user.profile?.bio || <span className="text-[var(--muted-foreground)] italic">No bio provided.</span>}
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)]"><GraduationCap size={16} /></div>
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)]">College</p>
                      <p className="text-sm font-medium text-[var(--foreground)]">{user.profile?.college || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)]"><Code size={16} /></div>
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)]">Branch</p>
                      <p className="text-sm font-medium text-[var(--foreground)]">{user.profile?.branch || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)]"><MapPin size={16} /></div>
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)]">Year</p>
                      <p className="text-sm font-medium text-[var(--foreground)]">{user.profile?.year || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Skills & Experience */}
          <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6">
            <h3 className="text-sm font-bold text-[var(--foreground)] mb-4 uppercase tracking-wider text-[var(--muted-foreground)]">Skills & Expertise</h3>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Experience Level</label>
                    <select {...register('experienceLevel')} className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-sm">
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Preferred Domain</label>
                    <input {...register('preferredDomain')} placeholder="e.g. Web Development, ML" className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Primary Skills (comma separated)</label>
                  <input {...register('primarySkills')} placeholder="React, Node.js, TypeScript" className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Secondary Skills (comma separated)</label>
                  <input {...register('secondarySkills')} placeholder="Docker, AWS, Python" className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Technology Stack (comma separated)</label>
                  <input {...register('technologyStack')} placeholder="MERN, Next.js, Django" className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-sm" />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)] mb-1">Experience Level</p>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                      {user.experienceLevel}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--muted-foreground)] mb-1">Preferred Domain</p>
                    <p className="text-sm font-medium text-[var(--foreground)]">{user.profile?.preferredDomain || '-'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-2">Primary Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {user.primarySkills?.length ? user.primarySkills.map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium">
                        {skill}
                      </span>
                    )) : <span className="text-sm text-[var(--muted-foreground)]">-</span>}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-2">Secondary Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {user.secondarySkills?.length ? user.secondarySkills.map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-[var(--muted)] text-[var(--foreground)] text-xs font-medium border border-[var(--border)]">
                        {skill}
                      </span>
                    )) : <span className="text-sm text-[var(--muted-foreground)]">-</span>}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-2">Technology Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {user.profile?.technologyStack?.length ? user.profile.technologyStack.map((tech, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800 text-xs font-medium">
                        {tech}
                      </span>
                    )) : <span className="text-sm text-[var(--muted-foreground)]">-</span>}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
