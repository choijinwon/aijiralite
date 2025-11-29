// hooks/useAuth.js
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { generateToken } from '../lib/auth';

export function useAuth() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // If user is authenticated via NextAuth but no token in localStorage,
    // we need to handle this differently since we can't generate JWT on client
    // For now, API routes will need to handle NextAuth sessions
    if (status === 'authenticated' && session?.user && typeof window !== 'undefined') {
      // Store session info for API calls
      // Note: API routes should check NextAuth session first, then JWT token
    }
  }, [session, status]);

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
}

