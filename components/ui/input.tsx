import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    const classes = [
      'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
      'placeholder:text-gray-400',
      'focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    ].join(' ');

    return <input ref={ref} className={classes} {...props} />;
  },
);

Input.displayName = 'Input';
