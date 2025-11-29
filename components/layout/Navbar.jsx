// components/layout/Navbar.jsx
'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  User, 
  LogOut, 
  Menu, 
  X,
  Bell,
  HelpCircle
} from 'lucide-react';
import Button from '../ui/Button';
import { getInitials } from '../../lib/utils';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    localStorage.removeItem('token');
    router.push('/');
  };

  if (!session) {
    return null;
  }

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo and Main Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-1 sm:gap-2">
              <span className="text-lg sm:text-2xl font-bold text-primary-600">Jira Lite</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 overflow-x-auto">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  router.pathname === '/dashboard'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 inline mr-2" />
                Dashboard
              </Link>
              <Link
                href="/overview"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  router.pathname === '/overview'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FolderKanban className="w-4 h-4 inline mr-2" />
                Teams & Projects
              </Link>
              <Link
                href="/teams"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  router.pathname.startsWith('/teams')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Teams
              </Link>
              <Link
                href="/projects"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  router.pathname.startsWith('/projects')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FolderKanban className="w-4 h-4 inline mr-2" />
                Projects
              </Link>
            </div>
          </div>

          {/* Right Side - User Menu */}
          <div className="flex items-center gap-4">
            {/* Help */}
            <Link
              href="/help"
              className={`p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors ${
                router.pathname === '/help'
                  ? 'bg-primary-50 text-primary-700'
                  : ''
              }`}
              title="도움말"
            >
              <HelpCircle className="w-5 h-5" />
            </Link>
            {/* Notifications */}
            <NotificationDropdown />

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50"
              >
                {session.user.image || session.user.avatar ? (
                  <img
                    src={session.user.image || session.user.avatar}
                    alt={session.user.name}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.nextElementSibling;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div 
                  className={`w-8 h-8 rounded-full bg-primary-500 text-white text-sm flex items-center justify-center ${
                    (session.user.image || session.user.avatar) ? 'hidden' : ''
                  }`}
                >
                  {getInitials(session.user.name || 'U')}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {session.user.name}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsProfileMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  router.pathname === '/dashboard'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4 inline mr-2" />
                Dashboard
              </Link>
              <Link
                href="/overview"
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  router.pathname === '/overview'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FolderKanban className="w-4 h-4 inline mr-2" />
                Teams & Projects
              </Link>
              <Link
                href="/teams"
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  router.pathname.startsWith('/teams')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Teams
              </Link>
              <Link
                href="/projects"
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  router.pathname.startsWith('/projects')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FolderKanban className="w-4 h-4 inline mr-2" />
                Projects
              </Link>
              <Link
                href="/help"
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  router.pathname === '/help'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <HelpCircle className="w-4 h-4 inline mr-2" />
                도움말
              </Link>
              <Link
                href="/profile"
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-4 h-4 inline mr-2" />
                Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <LogOut className="w-4 h-4 inline mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

