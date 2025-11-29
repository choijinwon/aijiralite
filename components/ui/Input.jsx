// components/ui/Input.jsx
'use client';

import React from 'react';
import { cn } from '../../lib/utils';

const Input = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn('input', className)}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;

