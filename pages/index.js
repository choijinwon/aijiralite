// pages/index.js
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

export default function Home() {
  const { data: session, status } = useSession();
  const { user: supabaseUser, loading: supabaseLoading } = useSupabaseAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for router to be ready
    if (!router.isReady) return;

    // Check both NextAuth and Supabase auth
    const isAuthenticated = (status === 'authenticated' && session) || supabaseUser;
    const isLoading = status === 'loading' || supabaseLoading;

    if (!isLoading) {
      if (isAuthenticated) {
        // Redirect authenticated users to dashboard
        router.replace('/dashboard');
      } else {
        // Redirect unauthenticated users to signin page
        router.replace('/auth/signin');
      }
    }
  }, [router.isReady, status, session, supabaseUser, supabaseLoading, router]);

  // Show loading while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

