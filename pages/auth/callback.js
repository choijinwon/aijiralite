// pages/auth/callback.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Loading from '../../components/ui/Loading';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Auth callback error:', sessionError);
          setError(sessionError.message);
          setTimeout(() => {
            router.push('/auth/signin?error=OAuthSignin');
          }, 2000);
          return;
        }

        if (session?.user) {
          // User is authenticated, redirect to dashboard
          router.push('/dashboard');
        } else {
          // No session, wait a bit for the session to be established
          // Sometimes there's a delay in the OAuth callback
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (retrySession?.user) {
              router.push('/dashboard');
            } else {
              router.push('/auth/signin?error=NoSession');
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Callback exception:', error);
        setError(error.message);
        setTimeout(() => {
          router.push('/auth/signin?error=OAuthSignin');
        }, 2000);
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      handleAuthCallback();
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {error ? (
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      ) : (
        <Loading text="Completing sign in..." />
      )}
    </div>
  );
}

