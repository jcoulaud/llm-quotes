const RATE_LIMIT_KEY = 'quote_submissions';
const MAX_SUBMISSIONS_PER_DAY = 5;

interface RateLimitData {
  date: string;
  count: number;
  submissions: string[];
}

export function checkRateLimit(): { allowed: boolean; remaining: number } {
  if (typeof window === 'undefined') {
    return { allowed: true, remaining: MAX_SUBMISSIONS_PER_DAY };
  }

  const today = new Date().toDateString();
  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  
  let data: RateLimitData;
  if (stored) {
    data = JSON.parse(stored);
    if (data.date !== today) {
      data = { date: today, count: 0, submissions: [] };
    }
  } else {
    data = { date: today, count: 0, submissions: [] };
  }

  const remaining = MAX_SUBMISSIONS_PER_DAY - data.count;
  return {
    allowed: data.count < MAX_SUBMISSIONS_PER_DAY,
    remaining: Math.max(0, remaining),
  };
}

export function incrementRateLimit(quoteContent: string): void {
  if (typeof window === 'undefined') return;

  const today = new Date().toDateString();
  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  
  let data: RateLimitData;
  if (stored) {
    data = JSON.parse(stored);
    if (data.date !== today) {
      data = { date: today, count: 0, submissions: [] };
    }
  } else {
    data = { date: today, count: 0, submissions: [] };
  }

  data.count++;
  data.submissions.push(quoteContent.slice(0, 50));
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
}