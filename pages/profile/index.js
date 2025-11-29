// pages/profile/index.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { api } from '../../utils/api';
import ProfileForm from '../../components/profile/ProfileForm';
import PasswordForm from '../../components/profile/PasswordForm';
import Button from '../../components/ui/Button';
import { ArrowLeft, User, Settings, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../lib/utils';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    // Wait for session to load
    if (status === 'loading') {
      return;
    }

    // If not authenticated, redirect to signin
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    // If authenticated, fetch profile
    if (status === 'authenticated' && session?.user) {
      fetchProfile();
    }
  }, [status, session]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userData = await api.getProfile();

      if (userData.error) {
        throw new Error(userData.error);
      }

      setUser(userData);
    } catch (error) {
      console.error('Profile fetch error:', error);
      // Only redirect if it's an authentication error
      if (error.message?.includes('Unauthorized') || error.message?.includes('authentication')) {
        toast.error('Please sign in to view your profile');
        router.push('/auth/signin');
      } else {
        toast.error('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  // Show loading state while checking authentication or fetching profile
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // If no user data after loading, show error
  if (!user && status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <p className="text-gray-600 mb-4">Failed to load profile data</p>
          <Button onClick={fetchProfile}>Retry</Button>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render (redirect will happen)
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">Profile Settings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'password'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Lock className="w-5 h-5" />
                <span>Password</span>
              </button>
            </div>

            {/* User Info Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <div className="text-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <div
                  className={`w-20 h-20 rounded-full mx-auto mb-4 bg-primary-500 text-white text-2xl flex items-center justify-center ${
                    user.avatar ? 'hidden' : ''
                  }`}
                >
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Member since {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Settings className="w-5 h-5" />
                    <h2 className="text-xl font-semibold">Edit Profile</h2>
                  </div>
                  <ProfileForm user={user} onUpdate={handleProfileUpdate} />
                </div>
              )}

              {activeTab === 'password' && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Lock className="w-5 h-5" />
                    <h2 className="text-xl font-semibold">Change Password</h2>
                  </div>
                  <PasswordForm provider={user.provider} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

