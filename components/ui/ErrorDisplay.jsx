// components/ui/ErrorDisplay.jsx
'use client';

import { AlertCircle, RefreshCw, X } from 'lucide-react';
import Button from './Button';

export default function ErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss,
  title = 'Error',
  className = '',
  variant = 'default' // 'default', 'inline', 'banner'
}) {
  if (!error) return null;

  const variants = {
    default: 'bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg',
    inline: 'bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-2 rounded',
    banner: 'bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg'
  };

  if (variant === 'banner') {
    return (
      <div className={`${variants.banner} ${className} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="ml-4 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`${variants[variant]} ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm">{error}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="secondary"
              size="sm"
              className="mt-3"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

