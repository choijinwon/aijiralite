// components/ui/Select.jsx
'use client';

import React from 'react';
import { cn } from '../../lib/utils';

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn('input', className)}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = 'Select';

export default Select;

