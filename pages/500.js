// pages/500.js
import { useRouter } from 'next/router';
import Button from '../components/ui/Button';

export default function Custom500() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">500</h1>
        <p className="text-xl text-gray-600 mb-8">Internal Server Error</p>
        <p className="text-gray-500 mb-8">
          Something went wrong on our end. Please try again later.
        </p>
        <div className="space-x-4">
          <Button onClick={() => router.push('/')}>
            Go Home
          </Button>
          <Button variant="secondary" onClick={() => router.reload()}>
            Reload
          </Button>
        </div>
      </div>
    </div>
  );
}

