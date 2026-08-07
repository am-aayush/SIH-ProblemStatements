import { z } from 'zod';
import { User } from '../context/AuthContext';
import { Task } from './pm';

export const ActionItemSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  assignedMember: z.union([z.string(), z.any()]).optional(),
  deadline: z.string().optional().nullable(),
  status: z.enum(['Pending', 'Converted']).default('Pending'),
  taskId: z.string().optional()
});

export type ActionItem = z.infer<typeof ActionItemSchema>;

export const MeetingSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  createdBy: z.union([z.string(), z.any()]).optional(),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  meetingType: z.enum(['Online', 'Offline']).default('Online'),
  location: z.string().optional(),
  meetingLink: z.string().url().optional().or(z.literal('')),
  agenda: z.array(z.string()).default([]),
  attendees: z.array(
    z.union([
      z.string(), // When creating, just array of user IDs is fine based on backend logic
      z.object({
        userId: z.union([z.string(), z.any()]),
        status: z.enum(['Present', 'Absent', 'Maybe', 'Pending'])
      })
    ])
  ).default([]),
  status: z.enum(['Scheduled', 'Completed', 'Cancelled']).default('Scheduled'),
  notes: z.object({
    summary: z.string().optional(),
    importantDecisions: z.string().optional(),
    futureDiscussion: z.string().optional()
  }).optional(),
  actionItems: z.array(ActionItemSchema).default([]),
  createdAt: z.string().optional()
});

export type Meeting = z.infer<typeof MeetingSchema>;
