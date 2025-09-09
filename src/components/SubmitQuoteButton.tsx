'use client';

export default function SubmitQuoteButton({ variant = 'default' }: { variant?: 'default' | 'ghost' }) {
  return (
    <button
      className={variant === 'ghost' ? 'brutal-button ghost' : 'brutal-button'}
      onClick={() => {
        const ev = new CustomEvent('open-submit-modal', { bubbles: true, composed: true });
        window.dispatchEvent(ev);
        document.dispatchEvent(ev);
      }}
    >
      Submit Quote
    </button>
  );
}
