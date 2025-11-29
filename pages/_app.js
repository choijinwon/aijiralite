// pages/_app.js
import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import Navbar from '../components/layout/Navbar';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import '../styles/globals.css';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();
  const hideNavbar = router.pathname === '/' || 
                     router.pathname.startsWith('/auth/') ||
                     router.pathname.startsWith('/teams/invite/');

  // Suppress harmless errors in console
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const originalError = console.error;
      const originalWarn = console.warn;

      // Filter out harmless errors
      console.error = (...args) => {
        const message = args[0]?.toString() || '';
        const stack = args[1]?.stack || '';
        const fullMessage = message + stack;
        
        // Chrome extension errors
        if (
          message.includes('runtime.lastError') ||
          message.includes('Could not establish connection') ||
          message.includes('Receiving end does not exist')
        ) {
          return;
        }
        
        // Next.js router abort errors (expected when redirecting during component load)
        if (
          message.includes('Abort fetching component for route') ||
          message.includes('handleCancelled') ||
          (message.includes('router.js') && message.includes('Abort'))
        ) {
          return;
        }
        
        originalError.apply(console, args);
      };

      console.warn = (...args) => {
        const message = args[0]?.toString() || '';
        if (
          message.includes('runtime.lastError') ||
          message.includes('Could not establish connection') ||
          message.includes('Receiving end does not exist')
        ) {
          return;
        }
        originalWarn.apply(console, args);
      };

      // Restore original console methods on unmount
      return () => {
        console.error = originalError;
        console.warn = originalWarn;
      };
    }
  }, []);

  return (
    <ErrorBoundary>
      <SessionProvider session={session}>
        {!hideNavbar && <Navbar />}
        <Component {...pageProps} />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </SessionProvider>
    </ErrorBoundary>
  );
}

