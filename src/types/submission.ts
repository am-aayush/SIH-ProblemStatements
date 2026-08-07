import { z } from 'zod';

export const MilestoneSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  status: z.enum(['Not Started', 'In Progress', 'Completed', 'Blocked']).default('Not Started'),
  progress: z.number().min(0).max(100).default(0),
  deadline: z.string().optional().nullable(),
  assignedMembers: z.array(z.union([z.string(), z.any()])).default([]),
  notes: z.string().optional()
});

export type Milestone = z.infer<typeof MilestoneSchema>;

export const SubmissionTrackerSchema = z.object({
  _id: z.string().optional(),
  teamId: z.string().optional(),
  overallProgress: z.number().default(0),
  milestones: z.array(MilestoneSchema).default([])
});

export type SubmissionTrackerData = z.infer<typeof SubmissionTrackerSchema>;
