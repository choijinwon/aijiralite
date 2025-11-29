// pages/auth/callback.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Loading from '../../components/ui/Loading';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Wait for router to be ready
    if (!router.isReady || isRedirecting) return;

    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback from URL hash
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        // Also check URL hash for OAuth tokens
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const errorParam = hashParams.get('error');

        if (errorParam) {
          console.error('OAuth error from URL:', errorParam);
          setError(errorParam);
          setIsRedirecting(true);
          setTimeout(() => {
            router.replace('/auth/signin?error=OAuthSignin');
          }, 2000);
          return;
        }

        if (sessionError && !accessToken) {
          console.error('Auth callback error:', sessionError);
          setError(sessionError.message);
          setIsRedirecting(true);
          setTimeout(() => {
            router.replace('/auth/signin?error=OAuthSignin');
          }, 2000);
          return;
        }

        // If we have an access token in the URL, wait for session to be established
        if (accessToken && !session) {
          console.log('Access token found, waiting for session...');
          // Wait a bit for Supabase to process the token
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data: { session: newSession }, error: newError } = await supabase.auth.getSession();
          
          if (newError) {
            console.error('Error getting session after OAuth:', newError);
            setError(newError.message);
            setIsRedirecting(true);
            setTimeout(() => {
              router.replace('/auth/signin?error=OAuthSignin');
            }, 2000);
            return;
          }

          if (newSession?.user) {
            console.log('Session established, redirecting to dashboard');
            setIsRedirecting(true);
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname);
            // Small delay to ensure router is ready
            setTimeout(() => {
              router.replace('/dashboard');
            }, 150);
            return;
          }
        }

        if (session?.user) {
          // User is authenticated, redirect to dashboard
          console.log('User authenticated, redirecting to dashboard');
          setIsRedirecting(true);
          // Small delay to ensure router is ready
          setTimeout(() => {
            router.replace('/dashboard');
          }, 150);
        } else {
          // No session, redirect to sign in
          console.log('No session found, redirecting to sign in');
          setIsRedirecting(true);
          router.replace('/auth/signin?error=NoSession');
        }
      } catch (error) {
        console.error('Callback exception:', error);
        setError(error.message);
        setIsRedirecting(true);
        setTimeout(() => {
          router.replace('/auth/signin?error=OAuthSignin');
        }, 2000);
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      handleAuthCallback();
    }
  }, [router.isReady, router, isRedirecting]);

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

