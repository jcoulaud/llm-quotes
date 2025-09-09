import { z } from 'zod';
import { LLM_SOURCES } from '@/types/llm-sources';

export const quoteSubmissionSchema = z.object({
  content: z.string()
    .min(10, 'Quote must be at least 10 characters')
    .max(500, 'Quote must be less than 500 characters'),
  llmSource: z.enum(LLM_SOURCES),
  twitterHandle: z.string()
    .regex(/^[A-Za-z0-9_]{1,15}$/, 'Invalid Twitter handle')
    .optional()
    .or(z.literal('')),
});

export type QuoteSubmission = z.infer<typeof quoteSubmissionSchema>;
