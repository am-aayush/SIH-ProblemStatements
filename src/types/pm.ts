import { z } from 'zod';

export const TaskSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  assignedTo: z.union([
    z.string(),
    z.object({ _id: z.string(), fullName: z.string(), email: z.string(), profile: z.object({ avatar: z.string().optional() }).optional() })
  ]).optional(),
  assignedBy: z.union([z.string(), z.object({ _id: z.string(), fullName: z.string() })]).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
  status: z.enum(['Todo', 'In Progress', 'Review', 'Completed', 'Blocked']).default('Todo'),
  deadline: z.string().optional().nullable(),
  estimatedHours: z.number().min(0).default(0),
  actualHours: z.number().min(0).default(0),
  completionPercentage: z.number().min(0).max(100).default(0),
  labels: z.array(z.string()).default([]),
  attachments: z.array(z.string()).default([]),
  problemStatementId: z.number().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Task = z.infer<typeof TaskSchema>;

export const StandupSchema = z.object({
  _id: z.string().optional(),
  userId: z.union([
    z.string(),
    z.object({ _id: z.string(), fullName: z.string(), role: z.string(), profile: z.object({ avatar: z.string().optional() }).optional() })
  ]),
  date: z.string(),
  yesterday: z.string().min(1, 'Required'),
  today: z.string().min(1, 'Required'),
  blockers: z.string().optional(),
  createdAt: z.string().optional(),
});

export type Standup = z.infer<typeof StandupSchema>;

export const NotificationSchema = z.object({
  _id: z.string(),
  teamId: z.string(),
  userId: z.string(),
  message: z.string(),
  type: z.enum(['TaskAssigned', 'TaskUpdated', 'TaskOverdue', 'ResearchAssigned', 'RoleChanged', 'MemberJoined', 'General']),
  read: z.boolean(),
  link: z.string().optional(),
  createdAt: z.string(),
});

export type Notification = z.infer<typeof NotificationSchema>;
