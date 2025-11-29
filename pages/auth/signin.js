// pages/auth/signin.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { loginSchema } from '../../lib/validations';
import { supabase } from '../../lib/supabase';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import toast from 'react-hot-toast';

export default function SignIn() {
  const router = useRouter();
  const { user: supabaseUser, loading: supabaseLoading } = useSupabaseAuth();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!router.isReady) return;
    
    if (supabaseUser && !supabaseLoading) {
      router.replace('/dashboard');
    }
  }, [router.isReady, supabaseUser, supabaseLoading, router]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Check if Supabase is valid and configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const isSupabaseValid = supabaseUrl && 
                              supabaseKey && 
                              supabaseUrl !== 'https://placeholder.supabase.co' &&
                              supabaseUrl.includes('.supabase.co') &&
                              supabase._isValid !== false;

      let supabaseAuthSuccess = false;

      // Try Supabase authentication first if valid
      if (isSupabaseValid) {
        try {
          const { data: authData, error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });

          if (!error && authData?.user) {
            supabaseAuthSuccess = true;
            toast.success('Signed in successfully');
            // Force page reload to ensure session is properly set
            window.location.href = '/dashboard';
            return;
          } else if (error) {
            // If Supabase returns 400 (user not found), fall back to NextAuth
            // Only log non-400 errors to avoid noise
            if (error.status !== 400) {
              console.warn('Supabase auth error:', error.message);
            }
          }
        } catch (supabaseError) {
          // Supabase error, fall back to NextAuth
          console.warn('Supabase authentication failed, falling back to NextAuth:', supabaseError.message);
        }
      }

      // Fall back to NextAuth/Credentials if Supabase failed or not configured
      if (!supabaseAuthSuccess) {
        // Use NextAuth signIn to create proper session
        const signInResult = await signIn('credentials', {
          redirect: false,
          email: data.email,
          password: data.password,
        });

        if (signInResult?.error) {
          toast.error('Invalid email or password');
        } else if (signInResult?.ok) {
          toast.success('Signed in successfully');
          // Force page reload to ensure session is properly set
          window.location.href = '/dashboard';
        } else {
          toast.error('Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login exception:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co') {
      toast.error('Supabase is not configured. Please check your environment variables.');
      console.error('Supabase configuration missing:', {
        url: supabaseUrl,
        key: supabaseKey ? 'set' : 'missing'
      });
      return;
    }

    setIsGoogleLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('Initiating Google OAuth with redirect:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error('Error signing in with Google', error);
        toast.error(error.message || 'Failed to sign in with Google');
        setIsGoogleLoading(false);
      } else if (data?.url) {
        // Redirect to Google OAuth page
        console.log('Redirecting to Google OAuth:', data.url);
        window.location.href = data.url;
        // Don't set loading to false here as we're redirecting
      } else {
        console.error('No redirect URL received from Supabase');
        toast.error('Failed to initiate Google sign in');
        setIsGoogleLoading(false);
      }
    } catch (error) {
      console.error('Google sign in exception:', error);
      toast.error('An error occurred. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              {...register('email')}
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <PasswordInput
              {...register('password')}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full mt-4"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/auth/signup" className="text-primary-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

