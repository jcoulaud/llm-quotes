'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import SubmitForm from '@/components/SubmitForm';

export default function Header() {
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const openHandler = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-submit-modal', openHandler as EventListener);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('open-submit-modal', openHandler as EventListener);
    };
  }, []);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // focus first focusable inside modal
      setTimeout(() => {
        const root = modalRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length > 0) focusables[0].focus();
      }, 0);

      // trap focus inside modal
      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        const root = modalRef.current;
        if (!root) return;
        const focusables = Array.from(
          root.querySelectorAll<HTMLElement>(
            'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute('disabled'));
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey) {
          if (active === first || !root.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTab);

      return () => {
        document.body.style.overflow = prev;
        document.removeEventListener('keydown', handleTab);
      };
    }
  }, [open]);

  return (
    <>
      <header className="relative z-10 nb-nav">
        <nav className="nb-container nb-nav-inner flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/logo.svg" alt="Logo" width={180} height={60} />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/quotes" className="text-sm font-medium transition-colors">
              QUOTES
            </Link>
            <button onClick={() => setOpen(true)} className="brutal-button text-sm">
              SUBMIT QUOTE
            </button>
          </div>
        </nav>
      </header>

      {open && (
        <div className="nb-modal-overlay" onClick={() => setOpen(false)}>
          <div
            className="nb-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Submit a Quote"
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="nb-h2">Submit a Quote</h2>
              <button className="brutal-button ghost" onClick={() => setOpen(false)} aria-label="Close">
                Close
              </button>
            </div>
            <div className="mt-2">
              <SubmitForm compact />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
