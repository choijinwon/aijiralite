// pages/notifications/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { api } from '../../utils/api';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { Bell, Check, CheckCheck, X, Copy, ExternalLink, Users, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Modal from '../../components/ui/Modal';

export default function NotificationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { user: supabaseUser, loading: supabaseLoading } = useSupabaseAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [inviteLink, setInviteLink] = useState(null);
  const [loadingInvite, setLoadingInvite] = useState(false);

  // Use Supabase user if available, otherwise use NextAuth session
  const currentUser = supabaseUser || session?.user;
  const currentUserEmail = supabaseUser?.email || session?.user?.email;

  useEffect(() => {
    // Check both NextAuth and Supabase auth
    const isAuthenticated = (status === 'authenticated' && session) || supabaseUser;
    const isLoading = status === 'loading' || supabaseLoading;

    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/signin');
      return;
    }

    if (isAuthenticated && !isLoading) {
      fetchNotifications();
    }
  }, [status, session, supabaseUser, supabaseLoading, router]);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('알림을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.markNotificationAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      toast.error('알림 읽음 처리에 실패했습니다.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('모든 알림을 읽음 처리했습니다.');
    } catch (error) {
      toast.error('알림 읽음 처리에 실패했습니다.');
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // 팀 초대 알림인 경우 초대 링크 확인
    if (notification.type === 'team_invited' && notification.entityId) {
      await fetchTeamInviteLink(notification.entityId);
      return;
    }

    // Navigate to the entity
    if (notification.entityType === 'issue' && notification.entityId) {
      router.push(`/issues/${notification.entityId}`);
    } else if (notification.entityType === 'team' && notification.entityId) {
      router.push(`/teams/${notification.entityId}`);
    } else if (notification.entityType === 'project' && notification.entityId) {
      router.push(`/projects/${notification.entityId}/kanban`);
    }
  };

  const fetchTeamInviteLink = async (teamId) => {
    if (!currentUserEmail) {
      toast.error('사용자 이메일을 찾을 수 없습니다.');
      return;
    }

    setLoadingInvite(true);
    try {
      // 현재 사용자의 초대 정보 가져오기
      const userInvite = await api.getMyTeamInvite(teamId);

      if (userInvite && userInvite.token) {
        const link = userInvite.inviteLink || `${window.location.origin}/teams/invite/${userInvite.token}`;
        setInviteLink(link);
        setSelectedInvite({
          teamId,
          email: userInvite.email,
          role: userInvite.role,
          expiresAt: userInvite.expiresAt,
          teamName: userInvite.team?.name,
          link
        });
      } else {
        toast.error('유효한 초대를 찾을 수 없습니다. 초대가 만료되었거나 이미 수락되었을 수 있습니다.');
      }
    } catch (error) {
      console.error('Failed to fetch team invite:', error);
      const errorMessage = error.message || '초대 링크를 가져오는데 실패했습니다.';
      if (errorMessage.includes('No pending invitation')) {
        toast.error('유효한 초대를 찾을 수 없습니다. 초대가 만료되었거나 이미 수락되었을 수 있습니다.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoadingInvite(false);
    }
  };

  const handleCopyInviteLink = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('초대 링크가 클립보드에 복사되었습니다.');
    } catch (error) {
      toast.error('클립보드 복사에 실패했습니다.');
    }
  };

  const handleOpenInviteLink = () => {
    if (inviteLink) {
      window.open(inviteLink, '_blank');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'issue_assigned':
        return '📋';
      case 'comment_added':
        return '💬';
      case 'due_date_soon':
      case 'due_date_today':
        return '⏰';
      case 'team_invited':
        return '👥';
      case 'role_changed':
        return '🔑';
      default:
        return '🔔';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Bell className="w-6 h-6" />
                  알림
                </h1>
                <p className="text-gray-600 mt-1">
                  {unreadCount > 0 ? `${unreadCount}개의 읽지 않은 알림` : '모든 알림을 읽었습니다'}
                </p>
              </div>
              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  variant="secondary"
                  size="sm"
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  모두 읽음 처리
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg">알림이 없습니다</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">{notification.message}</p>
                          <p className="text-sm text-gray-400">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="p-2 text-gray-400 hover:text-gray-600 rounded"
                              title="읽음 처리"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                          )}
                          {notification.type === 'team_invited' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (notification.entityId) {
                                  fetchTeamInviteLink(notification.entityId);
                                }
                              }}
                              className="p-2 text-blue-500 hover:text-blue-600 rounded"
                              title="초대 링크 확인"
                            >
                              <Mail className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Invite Link Modal */}
      <Modal
        isOpen={!!selectedInvite}
        onClose={() => {
          setSelectedInvite(null);
          setInviteLink(null);
        }}
        title="팀 초대 링크"
      >
        {loadingInvite ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">초대 링크를 불러오는 중...</p>
          </div>
        ) : selectedInvite ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>초대 정보:</strong>
              </p>
              {selectedInvite.teamName && (
                <p className="text-sm text-blue-700 mb-1">
                  <strong>팀:</strong> {selectedInvite.teamName}
                </p>
              )}
              <p className="text-sm text-blue-700 mb-1">
                <strong>이메일:</strong> {selectedInvite.email}
              </p>
              <p className="text-sm text-blue-700 mb-1">
                <strong>역할:</strong> {selectedInvite.role}
              </p>
              <p className="text-sm text-blue-700">
                <strong>만료일:</strong> {new Date(selectedInvite.expiresAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                초대 링크
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={selectedInvite.link}
                  readOnly
                  className="flex-1 input bg-gray-50"
                />
                <Button
                  onClick={handleCopyInviteLink}
                  variant="secondary"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  복사
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleOpenInviteLink}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                링크 열기
              </Button>
              <Button
                onClick={() => {
                  setSelectedInvite(null);
                  setInviteLink(null);
                }}
                variant="secondary"
              >
                닫기
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

