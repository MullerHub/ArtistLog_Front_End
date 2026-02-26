import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', ...props }, ref) => {
    const classes = [
      'flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
      'placeholder:text-gray-400',
      'focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    ].join(' ');

    return <textarea ref={ref} className={classes} {...props} />;
  },
);

Textarea.displayName = 'Textarea';
