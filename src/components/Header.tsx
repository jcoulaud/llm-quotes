'use client';

import SubmitForm from '@/components/SubmitForm';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
// using custom CSS bars for burger; no external icon

export default function Header() {
  const [open, setOpen] = useState(false); // submit modal
  const [mobileOpen, setMobileOpen] = useState(false); // mobile menu
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setMobileOpen(false);
      }
    };
    const openHandler = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-submit-modal', openHandler as EventListener);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('open-submit-modal', openHandler as EventListener);
    };
  }, []);

  // Always show Favorites link (no local dependency)

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // focus first focusable inside modal
      setTimeout(() => {
        const root = modalRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
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
            'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
          ),
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
      <header className='relative z-10 nb-nav'>
        <nav className='nb-container nb-nav-inner flex justify-between items-center'>
          <Link href='/' className='flex items-center gap-3 group'>
            <Image src='/logo.svg' alt='Logo' width={180} height={60} style={{ height: 'auto' }} />
          </Link>
          {/* Desktop nav */}
          <div className='hidden md:flex items-center gap-3'>
            <Link href='/quotes' className='text-sm font-medium transition-colors'>
              ALL QUOTES
            </Link>
            <Link href='/favorites' className='text-sm font-medium transition-colors'>
              FAVORITES
            </Link>
            <button onClick={() => setOpen(true)} className='brutal-button text-sm'>
              SUBMIT QUOTE
            </button>
          </div>
          {/* Mobile burger */}
          <button
            type='button'
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className='md:!hidden brutal-button ghost flex items-center gap-2'
            style={{ padding: '6px 11px' }}>
            <span className='relative block w-5 h-4.5' aria-hidden>
              <span
                className={`absolute left-0 right-0 block h-0.5 bg-black transition-transform ${
                  mobileOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0.5 translate-y-0 rotate-0'
                }`}
              />
              <span
                className={`absolute left-0 right-0 block h-0.5 bg-black transition-opacity top-1/2 -translate-y-1/2 ${
                  mobileOpen ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`absolute left-0 right-0 block h-0.5 bg-black transition-transform ${
                  mobileOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0.5 translate-y-0 rotate-0'
                }`}
              />
            </span>
          </button>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          className='fixed inset-0 z-50 bg-white nb-border-strong flex flex-col'
          role='dialog'
          aria-modal='true'
          aria-label='Mobile Menu'>
          {/* Top bar matching site header */}
          <div className='nb-nav'>
            <div className='nb-container nb-nav-inner flex items-center justify-between' style={{ paddingTop: 8, paddingBottom: 10 }}>
              <Link href='/' onClick={() => setMobileOpen(false)} className='flex items-center gap-3'>
                <Image src='/logo.svg' alt='Logo' width={170} height={56} />
              </Link>
              {/* Close button styled like burger, in X state */}
              {/* Copy style from submit modal close */}
              <button
                className='brutal-button ghost flex items-center gap-2'
                style={{ padding: '6px 11px' }}
                onClick={() => setMobileOpen(false)}
                aria-label='Close menu'>
                <span className='relative block w-5 h-5' aria-hidden>
                  <span className='absolute left-0 top-1/2 block h-0.5 w-5 bg-black rotate-45 -translate-y-1/2'></span>
                  <span className='absolute left-0 top-1/2 block h-0.5 w-5 bg-black -rotate-45 -translate-y-1/2'></span>
                </span>
              </button>
            </div>
          </div>
          <div className='nb-container flex-1 py-6'>
            <div className='flex flex-col gap-4'>
              <Link
                href='/'
                onClick={() => setMobileOpen(false)}
                className='text-lg font-extrabold tracking-wider'>
                HOME
              </Link>
              <Link
                href='/quotes'
                onClick={() => setMobileOpen(false)}
                className='text-lg font-extrabold tracking-wider'>
                ALL QUOTES
              </Link>
              <Link
                href='/favorites'
                onClick={() => setMobileOpen(false)}
                className='text-lg font-extrabold tracking-wider'>
                FAVORITES
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setOpen(true);
                }}
                className='brutal-button text-base self-start'>
                SUBMIT QUOTE
              </button>
            </div>
          </div>
        </div>
      )}

      {open && (
        <div className='nb-modal-overlay' onClick={() => setOpen(false)}>
          <div
            className='nb-modal'
            role='dialog'
            aria-modal='true'
            aria-label='Submit a Quote'
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='nb-h2'>Submit a Quote</h2>
              <button
                className='brutal-button ghost p-2 md:p-2.5 flex items-center justify-center'
                onClick={() => setOpen(false)}
                aria-label='Close'>
                <span className='relative block w-4 h-4 md:w-5 md:h-5' aria-hidden>
                  <span className='absolute left-0 top-1/2 block h-0.5 w-4 md:w-5 bg-black rotate-45 -translate-y-1/2'></span>
                  <span className='absolute left-0 top-1/2 block h-0.5 w-4 md:w-5 bg-black -rotate-45 -translate-y-1/2'></span>
                </span>
              </button>
            </div>
            <div className='mt-2'>
              <SubmitForm compact />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
