import React from 'react';

export interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Checkbox = ({ id, checked, onCheckedChange, disabled, className = '' }: CheckboxProps) => {
  const classes = [
    'h-4 w-4 rounded border border-gray-300 bg-white accent-gray-900',
    'focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    className,
  ].join(' ');

  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      disabled={disabled}
      className={classes}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  );
};
