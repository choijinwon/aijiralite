// pages/404.js
import { useRouter } from 'next/router';
import Button from '../components/ui/Button';

export default function Custom404() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page Not Found</p>
        <p className="text-gray-500 mb-8">
          The page you are looking for does not exist.
        </p>
        <div className="space-x-4">
          <Button onClick={() => router.push('/')}>
            Go Home
          </Button>
          <Button variant="secondary" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}

