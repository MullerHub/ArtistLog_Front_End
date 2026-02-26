'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { X } from 'lucide-react';

type ToastVariant = 'default' | 'destructive' | 'success';

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export const useToast = () => {
  const ctx = useContext(ToastContext);
  return {
    toast: (opts: Omit<ToastItem, 'id'>) => ctx.addToast(opts),
    toasts: ctx.toasts,
    dismiss: ctx.removeToast,
  };
};

const variantClasses: Record<ToastVariant, string> = {
  default: 'bg-white border border-gray-200 text-gray-900',
  destructive: 'bg-red-600 border-red-600 text-white',
  success: 'bg-green-600 border-green-600 text-white',
};

interface SingleToastProps {
  toast: ToastItem;
  onRemove: (id: string) => void;
}

const SingleToast = ({ toast, onRemove }: SingleToastProps) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onRemove(toast.id), 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, onRemove]);

  const variant = toast.variant ?? 'default';
  const classes = [
    'relative flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg',
    variantClasses[variant],
  ].join(' ');

  return (
    <div role="alert" aria-live="assertive" className={classes}>
      <div className="flex-1">
        {toast.title && <p className="text-sm font-semibold">{toast.title}</p>}
        {toast.description && <p className="text-sm mt-0.5 opacity-90">{toast.description}</p>}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 opacity-70 hover:opacity-100 focus:outline-none"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const Toast = SingleToast;

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((opts: Omit<ToastItem, 'id'>) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, ...opts }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast viewport */}
      <div
        aria-label="Notifications"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm"
      >
        {toasts.map((t) => (
          <SingleToast key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
