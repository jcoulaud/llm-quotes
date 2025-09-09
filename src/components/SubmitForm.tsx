'use client';

import { useState } from 'react';
import { quoteSubmissionSchema } from '@/lib/validation';
import { LLM_SOURCES } from '@/types/llm-sources';
import { checkRateLimit, incrementRateLimit } from '@/lib/rate-limit';

export default function SubmitForm({ compact = false }: { compact?: boolean }) {
  const [formData, setFormData] = useState({
    content: '',
    llmSource: 'ChatGPT',
    twitterHandle: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    // Check rate limit
    const { allowed } = checkRateLimit();
    if (!allowed) {
      setErrors({ general: 'You have reached the daily limit of 5 submissions. Please try again tomorrow.' });
      return;
    }

    // Validate form
    const validation = quoteSubmissionSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/quotes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit quote');
      }

      // Increment rate limit
      incrementRateLimit(validation.data.content);

      // Reset form
      setFormData({
        content: '',
        llmSource: 'ChatGPT',
        twitterHandle: '',
      });
      setSuccess(true);

      // Show remaining submissions
      const { remaining: newRemaining } = checkRateLimit();
      if (newRemaining > 0) {
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      }
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Failed to submit quote' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const { remaining } = checkRateLimit();

  return (
    <div className={compact ? "px-0" : "max-w-3xl mx-auto px-8 py-12"}>
      {!compact && (
        <div className="text-center mb-12">
          <h1 className="hero-text mb-4">Submit A Quote</h1>
          <p className="subtitle">Share the best AI-generated quotes with the community</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="brutal-card">
        {errors.general && (
          <div className="error-box mb-6">
            {errors.general}
          </div>
        )}
        
        {success && (
          <div className="success-box mb-6">
            <strong>Success!</strong> Your quote has been submitted for review.
            {remaining > 0 && ` You have ${remaining} submission${remaining === 1 ? '' : 's'} remaining today.`}
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="content" className="label">
            Quote Content
          </label>
          <textarea
            id="content"
            className="brutal-textarea"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Enter the AI-generated quote here..."
            disabled={isSubmitting}
          />
          {errors.content && (
            <p className="error-text">{errors.content}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="llmSource" className="label">
              LLM Source
            </label>
            <select
              id="llmSource"
              className="brutal-select"
              value={formData.llmSource}
              onChange={(e) => setFormData({ ...formData, llmSource: e.target.value })}
              disabled={isSubmitting}
            >
              {LLM_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
            {errors.llmSource && (
              <p className="error-text">{errors.llmSource}</p>
            )}
          </div>

          <div>
            <label htmlFor="twitterHandle" className="label">
              Your Twitter Handle (Optional)
            </label>
            <input
              id="twitterHandle"
              type="text"
              className="brutal-input"
              value={formData.twitterHandle}
              onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value.replace('@', '') })}
              placeholder="username"
              disabled={isSubmitting}
            />
            {errors.twitterHandle && (
              <p className="error-text">{errors.twitterHandle}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">We&apos;ll tag you when posted</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 pt-4 border-t">
          <button
            type="submit"
            className="btn btn-primary w-full md:w-auto"
            disabled={isSubmitting || remaining === 0}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quote'}
          </button>
          
          <span className="text-sm text-gray-600 mt-1 md:mt-0 md:ml-4 self-center text-center w-full md:w-auto md:self-auto md:text-left">
            {remaining > 0 
              ? `${remaining} submission${remaining === 1 ? '' : 's'} remaining today`
              : 'Daily limit reached'}
          </span>
        </div>
      </form>
    </div>
  );
}
