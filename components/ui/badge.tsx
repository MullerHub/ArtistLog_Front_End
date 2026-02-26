import React from 'react';

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-900 text-white',
  secondary: 'bg-gray-100 text-gray-900',
  outline: 'border border-gray-300 text-gray-900 bg-transparent',
  destructive: 'bg-red-600 text-white',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = ({ variant = 'default', className = '', ...props }: BadgeProps) => {
  const classes = [
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
    variantClasses[variant],
    className,
  ].join(' ');

  return <span className={classes} {...props} />;
};
