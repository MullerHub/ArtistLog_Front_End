import React from 'react';

type Variant = 'default' | 'outline' | 'ghost' | 'destructive';
type Size = 'default' | 'sm' | 'lg';

const variantClasses: Record<Variant, string> = {
  default: 'bg-gray-900 text-white hover:bg-gray-700',
  outline: 'border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-100',
  ghost: 'bg-transparent text-gray-900 hover:bg-gray-100',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
};

const sizeClasses: Record<Size, string> = {
  default: 'h-10 px-4 py-2 text-sm',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-12 px-6 text-base',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'default', className = '', ...props }, ref) => {
    const classes = [
      'inline-flex items-center justify-center rounded-md font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      variantClasses[variant],
      sizeClasses[size],
      className,
    ].join(' ');

    return <button ref={ref} className={classes} {...props} />;
  },
);

Button.displayName = 'Button';
