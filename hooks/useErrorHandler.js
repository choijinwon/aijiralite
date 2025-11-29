// hooks/useErrorHandler.js
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export function useErrorHandler() {
  const [error, setError] = useState(null);

  const handleError = useCallback((err, options = {}) => {
    const {
      showToast = true,
      toastMessage,
      onError,
      silent = false
    } = options;

    const errorMessage = err?.message || err?.error || 'An error occurred';
    
    if (!silent) {
      setError(errorMessage);
      
      if (showToast) {
        toast.error(toastMessage || errorMessage);
      }
    }

    if (onError) {
      onError(err);
    }

    console.error('Error:', err);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}

