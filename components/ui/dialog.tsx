'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue>({ open: false, setOpen: () => {} });

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog = ({ open = false, onOpenChange, children }: DialogProps) => {
  return (
    <DialogContext.Provider value={{ open, setOpen: onOpenChange ?? (() => {}) }}>
      {children}
    </DialogContext.Provider>
  );
};

export const DialogTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
  const { setOpen } = useContext(DialogContext);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
      onClick: () => setOpen(true),
    });
  }
  return <button onClick={() => setOpen(true)}>{children}</button>;
};

export const DialogContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const { open, setOpen } = useContext(DialogContext);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      contentRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, setOpen]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50"
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />
      {/* Content */}
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={[
          'relative z-50 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl',
          'focus:outline-none',
          className,
        ].join(' ')}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};

export const DialogHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={['flex flex-col space-y-1.5 mb-4', className].join(' ')}>{children}</div>
);

export const DialogTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h2 className={['text-lg font-semibold text-gray-900', className].join(' ')}>{children}</h2>
);

export const DialogDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={['text-sm text-gray-500', className].join(' ')}>{children}</p>
);

export const DialogFooter = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={['flex justify-end gap-2 mt-6', className].join(' ')}>{children}</div>
);
