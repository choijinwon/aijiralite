// pages/auth/error.js
import { useRouter } from 'next/router';
import Button from '../../components/ui/Button';

export default function AuthError() {
  const router = useRouter();
  const { error } = router.query;

  const getErrorMessage = (error) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      default:
        return 'An error occurred during authentication.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-6">
          {error ? getErrorMessage(error) : 'An unknown error occurred.'}
        </p>
        <div className="space-y-3">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => router.push('/auth/signin')}
          >
            Try Again
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => router.push('/')}
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}

