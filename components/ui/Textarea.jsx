// components/ui/Textarea.jsx
'use client';

import React from 'react';
import { cn } from '../../lib/utils';

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn('input min-h-[100px]', className)}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;

