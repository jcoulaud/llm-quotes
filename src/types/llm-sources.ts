export const LLM_SOURCES = [
  'ChatGPT',
  'Claude',
  'Grok',
  'Gemini',
  'Perplexity',
  'Other',
] as const;

export type LlmSource = typeof LLM_SOURCES[number];

