// components/ui/Card.jsx
'use client';

import { cn } from '../../lib/utils';

export default function Card({ children, className, onClick, hover = false }) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200 p-6',
        hover && 'hover:shadow-md transition-shadow cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

