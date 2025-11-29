// components/issue/DuplicateDetection.jsx
'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { api } from '../../utils/api';
import Link from 'next/link';
import Badge from '../ui/Badge';

export default function DuplicateDetection({ projectId, title, description, onDismiss }) {
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  const checkDuplicates = async () => {
    if (!title || title.length < 3) {
      return;
    }

    setLoading(true);
    try {
      const result = await api.detectDuplicates(projectId, title, description || '');
      if (result.duplicates && result.duplicates.length > 0) {
        setDuplicates(result.duplicates);
      }
    } catch (error) {
      console.error('Duplicate detection failed:', error);
    } finally {
      setLoading(false);
      setChecked(true);
    }
  };

  // Auto-check when title changes
  useEffect(() => {
    if (title && title.length >= 3 && !checked) {
      const timer = setTimeout(() => {
        checkDuplicates();
      }, 1000); // Debounce 1 second
      return () => clearTimeout(timer);
    }
  }, [title, description, projectId, checked]);

  if (duplicates.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-yellow-900 mb-2">
              Similar Issues Found
            </h4>
            {loading ? (
              <p className="text-sm text-yellow-700">Checking for duplicates...</p>
            ) : duplicates.length > 0 ? (
              <div className="space-y-2">
                {duplicates.map((dup, index) => (
                  <Link
                    key={index}
                    href={`/issues/${dup.id}`}
                    className="block p-2 bg-white rounded border border-yellow-200 hover:border-yellow-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {dup.title || `Issue #${dup.id.slice(0, 8)}`}
                        </p>
                        {dup.reason && (
                          <p className="text-xs text-gray-600 mt-1">{dup.reason}</p>
                        )}
                      </div>
                      {dup.similarity && (
                        <Badge variant="warning" className="ml-2">
                          {Math.round(dup.similarity * 100)}% match
                        </Badge>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-yellow-600 hover:text-yellow-800 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

