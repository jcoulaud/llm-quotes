import { z } from 'zod';

export const quoteSubmissionSchema = z.object({
  content: z.string()
    .min(10, 'Quote must be at least 10 characters')
    .max(500, 'Quote must be less than 500 characters'),
  llmSource: z.enum(['ChatGPT', 'Claude', 'Grok', 'Gemini', 'Perplexity', 'Other']),
  twitterHandle: z.string()
    .regex(/^[A-Za-z0-9_]{1,15}$/, 'Invalid Twitter handle')
    .optional()
    .or(z.literal('')),
});

export type QuoteSubmission = z.infer<typeof quoteSubmissionSchema>;