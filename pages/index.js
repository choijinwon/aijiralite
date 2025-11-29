// pages/index.js
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Button from '../components/ui/Button';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Jira Lite</h1>
        <p className="text-gray-600 mb-8">AI-powered issue tracking for your team</p>
        
        <div className="space-y-4">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => router.push('/auth/signin')}
          >
            Sign In
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => router.push('/auth/signup')}
          >
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
}

