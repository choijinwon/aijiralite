// pages/_error.js
import React from 'react';
import { useRouter } from 'next/router';
import Button from '../components/ui/Button';

function Error({ statusCode }) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          {statusCode || 'Error'}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          {statusCode
            ? `An error ${statusCode} occurred on server`
            : 'An error occurred on client'}
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

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

Error.displayName = 'Error';

export default Error;

