// pages/teams/invite/[token].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useSupabaseAuth } from '../../../hooks/useSupabaseAuth';
import { api } from '../../../utils/api';
import Button from '../../../components/ui/Button';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function InvitePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { user: supabaseUser, loading: supabaseLoading } = useSupabaseAuth();
  const { token } = router.query;
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    // Wait for router to be ready
    if (!router.isReady) return;

    // Check both NextAuth and Supabase auth
    const isAuthenticated = (status === 'authenticated' && session) || supabaseUser;
    const isLoading = status === 'loading' || supabaseLoading;

    if (!isLoading && !isAuthenticated) {
      router.push(`/auth/signin?callbackUrl=/teams/invite/${token}`);
      return;
    }

    if (isAuthenticated && !isLoading && token) {
      fetchInvite();
    }
  }, [router.isReady, token, status, session, supabaseUser, supabaseLoading, router]);

  const fetchInvite = async () => {
    try {
      const inviteData = await api.getInviteByToken(token);
      setInvite(inviteData);
    } catch (error) {
      toast.error('Invalid or expired invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await api.acceptInvite(token);
      toast.success('Successfully joined the team!');
      router.push(`/teams/${invite.team.id}`);
    } catch (error) {
      toast.error(error.message || 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">
            This invitation link is invalid or has expired.
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Get current user email from either NextAuth or Supabase
  const currentUserEmail = session?.user?.email || supabaseUser?.email;
  const isExpired = new Date() > new Date(invite.expiresAt);
  const emailMatch = currentUserEmail === invite.email;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        {isExpired ? (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Invitation Expired</h1>
            <p className="text-gray-600 mb-6">
              This invitation has expired. Please ask for a new invitation.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </>
        ) : !emailMatch ? (
          <>
            <XCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Email Mismatch</h1>
            <p className="text-gray-600 mb-6">
              This invitation is for <strong>{invite.email}</strong>, but you are signed in as <strong>{currentUserEmail}</strong>.
            </p>
            <Button onClick={() => router.push('/auth/signout')}>
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Team Invitation</h1>
            <p className="text-gray-600 mb-2">
              You've been invited to join
            </p>
            <p className="text-xl font-semibold mb-4">{invite.team.name}</p>
            <p className="text-sm text-gray-500 mb-6">
              Role: <span className="font-medium">{invite.role}</span>
            </p>
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={handleAccept}
                disabled={accepting}
              >
                {accepting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Accept Invitation'
                )}
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => router.push('/dashboard')}
              >
                Decline
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

