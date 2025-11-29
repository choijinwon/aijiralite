// components/ui/Modal.jsx
'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Modal({ isOpen, onClose, title, children, size = 'md', canClose = true }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const handleBackdropClick = () => {
    if (canClose) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    if (canClose) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black bg-opacity-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div 
        className={cn(
          'bg-white rounded-lg shadow-xl w-full my-auto',
          sizes[size],
          'max-h-[90vh] overflow-y-auto'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
          <button
            onClick={handleCloseClick}
            className={cn(
              "text-gray-400 hover:text-gray-600 p-1",
              !canClose && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Close"
            disabled={!canClose}
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

