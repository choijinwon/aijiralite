// lib/validations.js
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const teamSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
});

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  teamId: z.string().min(1, 'Team is required'),
  isArchived: z.boolean().optional(),
});

export const issueSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  projectId: z.string().min(1, 'Project is required'),
  labelIds: z.array(z.string()).optional(),
});

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
  issueId: z.string().min(1, 'Issue ID is required'),
});

