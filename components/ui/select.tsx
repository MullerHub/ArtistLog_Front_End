'use client';

import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const SelectContext = createContext<SelectContextValue>({
  value: '',
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
  triggerRef: { current: null },
});

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  children: React.ReactNode;
}

export const Select = ({ value, onValueChange, defaultValue = '', children }: SelectProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const controlled = value !== undefined;
  const currentValue = controlled ? value! : internalValue;

  const handleChange = (v: string) => {
    if (!controlled) setInternalValue(v);
    onValueChange?.(v);
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <SelectContext.Provider value={{ value: currentValue, onValueChange: handleChange, open, setOpen, triggerRef }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

export interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export const SelectTrigger = ({ children, className = '' }: SelectTriggerProps) => {
  const { open, setOpen, triggerRef } = useContext(SelectContext);

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className={[
        'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
        'focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      ].join(' ')}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { value } = useContext(SelectContext);
  return <span className={value ? '' : 'text-gray-400'}>{value || placeholder}</span>;
};

export interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SelectContent = ({ children, className = '' }: SelectContentProps) => {
  const { open, setOpen } = useContext(SelectContext);
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <ul
      ref={ref}
      role="listbox"
      className={[
        'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-md',
        className,
      ].join(' ')}
    >
      {children}
    </ul>
  );
};

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const SelectItem = ({ value, children, className = '' }: SelectItemProps) => {
  const ctx = useContext(SelectContext);
  const isSelected = ctx.value === value;

  return (
    <li
      role="option"
      aria-selected={isSelected}
      onClick={() => ctx.onValueChange(value)}
      className={[
        'cursor-pointer px-3 py-2 text-sm hover:bg-gray-100',
        isSelected ? 'font-medium text-gray-900 bg-gray-50' : 'text-gray-700',
        className,
      ].join(' ')}
    >
      {children}
    </li>
  );
};
