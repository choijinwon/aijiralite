// components/ui/EmptyState.jsx
'use client';

import { Inbox, Search, AlertCircle } from 'lucide-react';
import Button from './Button';

export default function EmptyState({ 
  icon: Icon = Inbox,
  title = 'No items found',
  message = 'Get started by creating your first item.',
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 max-w-sm mb-6">{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function EmptySearchState({ query, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
      <p className="text-sm text-gray-600 max-w-sm mb-6">
        No items match "{query}". Try adjusting your search.
      </p>
      {onClear && (
        <Button onClick={onClear} variant="secondary">
          Clear search
        </Button>
      )}
    </div>
  );
}

export function EmptyErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-sm text-gray-600 max-w-sm mb-6">{error}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          Try again
        </Button>
      )}
    </div>
  );
}
