'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
};

type ToastContextValue = {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Provide a safe no-op fallback so calls don't crash if provider missing
    return {
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }
  return ctx;
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  return (
    <div
      className={
        `nb-toast ${
          toast.type === 'success' ? 'nb-toast-success' : toast.type === 'error' ? 'nb-toast-error' : 'nb-toast-info'
        }`
      }
      role="status"
      aria-live="polite"
    >
      <span className="nb-toast-message">{toast.message}</span>
      <button
        className="nb-toast-close"
        aria-label="Close"
        onClick={() => onClose(toast.id)}
      >
        ✕
      </button>
    </div>
  );
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((message: string, type: ToastType, duration = 3500) => {
    idRef.current += 1;
    const id = `${Date.now()}-${idRef.current}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const api = useMemo<ToastContextValue>(
    () => ({
      success: (m, d) => add(m, 'success', d),
      error: (m, d) => add(m, 'error', d),
      info: (m, d) => add(m, 'info', d),
    }),
    [add]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="nb-toast-container" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={remove} />)
        )}
      </div>
    </ToastContext.Provider>
  );
}

