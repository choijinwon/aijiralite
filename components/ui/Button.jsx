// components/ui/Button.jsx
'use client';

import { cn } from '../../lib/utils';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className, 
  disabled,
  ...props 
}) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn('btn flex items-center justify-center', variants[variant], sizes[size], className, disabled && 'opacity-50 cursor-not-allowed')}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

