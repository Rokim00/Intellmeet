import { z } from 'zod';

// Sanitize helpers
const sanitizedString = (min: number, label: string) =>
  z.string().trim().min(min, `${label} must be at least ${min} characters`);

export const loginSchema = z.object({
  userEmail: z
    .email('Please enter a valid email address')
    .min(1, 'Email is required')
    .trim()
    .toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z
  .object({
    userName: sanitizedString(2, 'Name').max(60, 'Name is too long'),
    userEmail: z
      .email('Please enter a valid email address')
      .min(1, 'Email is required')
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(72, 'Password is too long'),
    isCreatingOrg: z.boolean(),
    organizationName: z.string().trim().optional(),
    organizationLocation: z.string().trim().optional(),
    organizationSlug: z.string().trim().optional(),
    inviteCode: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isCreatingOrg) {
      if (!data.organizationName || data.organizationName.length < 2) {
        ctx.addIssue({
          code: 'custom',
          path: ['organizationName'],
          message: 'Organization name must be at least 2 characters',
        });
      }
    } else {
      if (!data.inviteCode || data.inviteCode.length < 4) {
        ctx.addIssue({
          code: 'custom',
          path: ['inviteCode'],
          message: 'Please enter a valid invite code',
        });
      }
    }
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;

export const meetingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Meeting subject must be at least 3 characters')
    .max(120, 'Meeting subject is too long'),
  duration: z.enum(['15 mins', '30 mins', '45 mins', '60 mins']),
});

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Task title must be at least 3 characters')
    .max(140, 'Task title is too long'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  status: z.enum(['To Do', 'In Progress', 'Done']),
  assignee: z.string().trim().min(1, 'Assignee is required').max(60, 'Assignee is too long'),
});

export type MeetingFormValues = z.infer<typeof meetingSchema>;
export type TaskFormValues = z.infer<typeof taskSchema>;
