import { z } from 'zod';

// File validation
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

// Upload form validation
export const uploadFormSchema = z.object({
  file: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, 'File is required')
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      'File size must be less than 10MB'
    )
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'File must be PDF, JPEG, or PNG'
    ),
  template_mode: z.enum(['existing', 'new']),
  template_id: z.string().optional(),
  new_template_name: z.string().optional(),
  new_template_description: z.string().optional(),
  new_template_level_of_details: z.string().optional(),
}).refine(
  (data) => {
    if (data.template_mode === 'existing') {
      return !!data.template_id;
    }
    return (
      !!data.new_template_name &&
      !!data.new_template_description &&
      !!data.new_template_level_of_details
    );
  },
  {
    message: 'Please provide all required fields for your selected template mode',
    path: ['template_mode'],
  }
);

// Template creation validation
export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  level_of_details: z.string().min(1, 'Level of details is required').max(100),
});

// API validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const documentIdSchema = z.object({
  id: z.string().uuid('Invalid document ID'),
});

export const templateIdSchema = z.object({
  id: z.string().uuid('Invalid template ID'),
});





