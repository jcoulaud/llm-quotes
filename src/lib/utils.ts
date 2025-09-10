export function generateSlug(text: string): string {
  const timestamp = Date.now();
  const textPart = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
  return `${textPart}-${timestamp}`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatDateOnly(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    scheduled: 'badge-scheduled',
    posted: 'badge-posted',
    rejected: 'badge-rejected',
  };
  return colors[status] || 'badge-pending';
}
