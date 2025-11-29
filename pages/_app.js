// pages/_app.js
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

