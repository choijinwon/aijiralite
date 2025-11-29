// pages/teams/[id]/index.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useSupabaseAuth } from '../../../hooks/useSupabaseAuth';
import { api } from '../../../utils/api';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import { Users, Mail, UserPlus, Settings, Trash2, Crown, Shield, User as UserIcon, X, Plus, FolderKanban, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema } from '../../../lib/validations';
import { TEAM_ROLES } from '../../../utils/constants';
import { getInitials } from '../../../lib/utils';
import ProjectForm from '../../../components/forms/ProjectForm';

export default function TeamDetailPage() {
  const { data: session, status } = useSession();
  const { user: supabaseUser, loading: supabaseLoading } = useSupabaseAuth();
  const router = useRouter();
  const { id } = router.query;
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userProvider, setUserProvider] = useState(null);

  // Use Supabase user if available, otherwise use NextAuth session
  const currentUser = supabaseUser || session?.user;
  const currentUserId = supabaseUser?.id || session?.user?.id;
  
  // Debug: Log current user info
  useEffect(() => {
    if (currentUserId) {
      console.log('👤 [USER INFO] Current user ID:', {
        currentUserId,
        supabaseUserId: supabaseUser?.id,
        sessionUserId: session?.user?.id,
        hasSupabaseUser: !!supabaseUser,
        hasSession: !!session,
        sessionStatus: status
      });
    }
  }, [currentUserId, supabaseUser, session, status]);

  // 각 폼에 별도의 useForm 사용 (충돌 방지)
  const inviteForm = useForm(); // 초대 폼용
  const teamSettingsForm = useForm(); // 팀 설정 폼용
  const projectForm = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: '', description: '', teamId: id }
  });

  useEffect(() => {
    // Wait for router to be ready
    if (!router.isReady) return;

    // Check both NextAuth and Supabase auth
    const isAuthenticated = (status === 'authenticated' && session) || supabaseUser;
    const isLoading = status === 'loading' || supabaseLoading;

    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/signin');
      return;
    }

    if (isAuthenticated && !isLoading && id) {
      fetchTeamData();
    }
  }, [router.isReady, status, session, supabaseUser, supabaseLoading, id, router]);

  const fetchTeamData = async () => {
    try {
      const [teamData, membersData, invitesData, userProfile] = await Promise.all([
        api.getTeam(id),
        api.getTeamMembers(id),
        api.getTeamInvites(id).catch(() => []), // Invites might fail if not admin
        api.getProfile().catch(() => null) // Get user profile to check provider
      ]);

      setTeam(teamData);
      setMembers(membersData);
      setInvites(invitesData || []);

      // Set user provider (Google 로그인 확인용)
      if (userProfile?.provider) {
        setUserProvider(userProfile.provider);
      }

      // Use userProfile ID if available (more reliable than session ID)
      const actualUserId = userProfile?.id || currentUserId;

      // Debug: Log all relevant IDs before role detection
      console.log('🔍 [ROLE DETECTION] Before role check:', {
        currentUserId,
        actualUserId,
        userProfileId: userProfile?.id,
        currentUserIdType: typeof currentUserId,
        actualUserIdType: typeof actualUserId,
        teamOwnerId: teamData.ownerId,
        teamOwnerIdType: typeof teamData.ownerId,
        membersDataLength: membersData.length,
        allMemberUserIds: membersData.map(m => ({
          memberId: m.user?.id,
          memberIdType: typeof m.user?.id,
          role: m.role,
          userId: m.userId
        })),
        supabaseUserId: supabaseUser?.id,
        sessionUserId: session?.user?.id
      });

      // Find current user's role using actualUserId
      // Try multiple ways to match user ID
      const currentUserMember = membersData.find(m => {
        const memberUserId = m.user?.id || m.userId;
        return String(memberUserId) === String(actualUserId) || 
               String(memberUserId) === String(currentUserId);
      });
      
      // Check if user is owner (try both string and comparison with both IDs)
      const isOwnerById = String(teamData.ownerId) === String(actualUserId) ||
                         String(teamData.ownerId) === String(currentUserId);
      
      if (isOwnerById) {
        console.log('✅ [ROLE DETECTION] User is OWNER');
        setUserRole('OWNER');
      } else if (currentUserMember) {
        console.log('✅ [ROLE DETECTION] User is member with role:', currentUserMember.role);
        setUserRole(currentUserMember.role);
      } else {
        console.warn('⚠️ [ROLE DETECTION] User role not found. Setting to null.');
        console.warn('   Details:', {
          currentUserId,
          actualUserId,
          teamOwnerId: teamData.ownerId,
          foundMember: currentUserMember,
          membersData: membersData.map(m => ({ 
            id: m.user?.id || m.userId, 
            role: m.role,
            userId: m.userId 
          }))
        });
        setUserRole(null);
      }
      
      // Debug: Log final role information
      console.log('👥 [ROLE DETECTION] Final result:', {
        userId: currentUserId,
        teamOwnerId: teamData.ownerId,
        isOwnerById,
        currentUserMember: currentUserMember ? {
          id: currentUserMember.user?.id || currentUserMember.userId,
          role: currentUserMember.role
        } : null,
        determinedRole: isOwnerById ? 'OWNER' : (currentUserMember?.role || null),
        userProvider: userProfile?.provider || 'unknown'
      });

      // Update project form with team ID
      if (id) {
        projectForm.reset({ name: '', description: '', teamId: id });
      }
    } catch (error) {
      toast.error('Failed to load team');
      router.push('/teams');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (data) => {
    console.log('📧 [INVITE] handleInvite 함수 호출됨:', {
      data,
      isSendingInvite,
      teamId: id,
      timestamp: new Date().toISOString()
    });
    
    // 중복 클릭 방지
    if (isSendingInvite) {
      console.warn('⚠️ 이미 발송 중입니다. 중복 클릭 무시됨.');
      return;
    }
    
    // 데이터 유효성 검사
    if (!data || !data.email) {
      console.error('❌ [INVITE] 이메일 데이터가 없습니다:', data);
      toast.error('이메일 주소를 입력해주세요.');
      return;
    }
    
    console.log('🖱️ [BUTTON CLICK] Send 버튼 클릭됨:', { 
      teamId: id, 
      email: data.email, 
      role: data.role,
      isSendingInvite: isSendingInvite,
      timestamp: new Date().toISOString()
    });
    
    setIsSendingInvite(true);
    
    // 즉시 피드백: 버튼 클릭 반응 표시
    const loadingToast = toast.loading('🔄 초대를 생성하고 이메일을 발송하는 중...', {
      duration: 10000,
    });
    
    try {
      
      // 초대 생성 시작 알림
      toast.loading('📝 초대 생성 중...', { id: loadingToast });
      
      const invite = await api.createTeamInvite(id, data.email, data.role || 'MEMBER');
      
      // 초대 생성 완료, 이메일 발송 중 알림
      toast.loading('📧 이메일 발송 중...', { id: loadingToast });
      
      if (!invite || !invite.id) {
        throw new Error('Failed to create invitation. No invite data returned.');
      }
      
      console.log('✅ Invite created successfully:', {
        id: invite.id,
        email: invite.email,
        emailSent: invite.emailSent,
        emailError: invite.emailError,
        inviteLink: invite.inviteLink
      });
      
      // Refresh invites list to get the latest data
      try {
        const updatedInvites = await api.getTeamInvites(id);
        setInvites(updatedInvites || []);
        console.log('Invites list refreshed:', updatedInvites?.length || 0, 'invites');
      } catch (refreshError) {
        console.warn('Failed to refresh invites list, adding manually:', refreshError);
        // If refresh fails, add the new invite to the list
        setInvites([invite, ...invites]);
      }
      
      setIsInviteModalOpen(false);
      inviteForm.reset();
      
      // Use inviteLink from response, or generate it from token
      const inviteLink = invite.inviteLink || 
        (invite.token ? `${window.location.origin}/teams/invite/${invite.token}` : null);
      
      // 로딩 토스트 제거하고 최종 결과 표시
      toast.dismiss(loadingToast);
      
      // Show clear success/failure message based on email status
      if (invite.emailSent === true) {
        // ✅ 이메일 발송 성공
        toast.success(
          `✅ 이메일 발송 성공!\n초대 이메일이 ${data.email}로 발송되었습니다.`,
          {
            duration: 5000,
            icon: '✅',
          }
        );
        console.log('✅ [USER FEEDBACK] Email sent successfully to:', data.email);
      } else {
        // ❌ 이메일 발송 실패
        const errorMessage = invite.emailError || '이메일 서비스가 설정되지 않았습니다.';
        console.error('❌ [USER FEEDBACK] Email send failed:', {
          email: data.email,
          error: errorMessage,
          inviteLink: inviteLink
        });
        
        // 에러 타입별 구체적인 안내
        const isGmailAuthError = errorMessage.includes('EAUTH') || 
                                 errorMessage.includes('BadCredentials') ||
                                 errorMessage.includes('Username and Password not accepted') ||
                                 errorMessage.includes('Gmail 인증 실패');
        const isGmailConnectionError = errorMessage.includes('ECONNECTION') || 
                                       errorMessage.includes('ETIMEDOUT') ||
                                       errorMessage.includes('Gmail 연결 실패');
        const isNotConfigured = errorMessage.includes('설정되지 않았습니다') ||
                                errorMessage.includes('not configured');
        
        if (isGmailAuthError) {
          toast.error(
            `❌ Gmail 인증 실패\n\nGmail 앱 비밀번호가 올바르지 않습니다.\n\n해결 방법:\n1. Google 계정 > 보안 > 2단계 인증 활성화\n2. 앱 비밀번호 생성 (16자리)\n3. .env.local의 SMTP_PASS 업데이트\n4. 서버 재시작\n\n초대는 생성되었습니다. 아래 링크를 수동으로 공유해주세요.`,
            {
              duration: 15000,
              icon: '❌',
            }
          );
        } else if (isGmailConnectionError) {
          toast.error(
            `❌ Gmail 연결 실패\n\n네트워크 연결 문제입니다.\n\n확인 사항:\n1. 인터넷 연결 확인\n2. 방화벽 설정 확인\n3. SMTP 포트(587) 차단 여부 확인\n\n초대는 생성되었습니다. 아래 링크를 수동으로 공유해주세요.`,
            {
              duration: 12000,
              icon: '❌',
            }
          );
        } else if (isNotConfigured) {
          toast.error(
            `❌ 이메일 서비스 미설정\n\n${errorMessage}\n\n초대는 생성되었습니다. 아래 링크를 수동으로 공유해주세요.`,
            {
              duration: 10000,
              icon: '❌',
            }
          );
        } else {
          toast.error(
            `❌ 이메일 발송 실패\n${errorMessage}\n\n초대는 생성되었습니다. 아래 링크를 수동으로 공유해주세요.`,
            {
              duration: 10000,
              icon: '❌',
            }
          );
        }
        
        // 클립보드에 링크 복사
        if (inviteLink) {
          try {
            await navigator.clipboard.writeText(inviteLink);
            toast.success(
              `📋 초대 링크가 클립보드에 복사되었습니다.\n링크를 ${data.email}에게 공유해주세요.`,
              {
                duration: 8000,
              }
            );
            console.log('✅ 초대 링크가 클립보드에 복사됨:', inviteLink);
          } catch (clipboardError) {
            console.warn('Failed to copy to clipboard:', clipboardError);
            // 링크를 토스트에 표시
            toast.success(
              `📋 초대 링크 (수동 복사):\n${inviteLink}`,
              {
                duration: 12000,
              }
            );
          }
        }
      }
    } catch (error) {
      // 로딩 토스트 제거
      toast.dismiss(loadingToast);
      
      console.error('❌ [USER FEEDBACK] Invite error details:', error);
      const errorMessage = error.message || '초대 발송에 실패했습니다.';
      
      // More specific error messages (한국어 에러 메시지 지원)
      if (errorMessage.includes('이미 팀 멤버') || errorMessage.includes('already a team member')) {
        toast.error(`❌ ${data.email}은(는) 이미 팀 멤버입니다.`, {
          duration: 5000,
          icon: '❌',
        });
      } else if (errorMessage.includes('이미 초대가 발송') || errorMessage.includes('already sent') || errorMessage.includes('Invitation already sent')) {
        toast.error(`❌ ${data.email}로 이미 초대가 발송되었습니다.`, {
          duration: 5000,
          icon: '❌',
        });
      } else if (errorMessage.includes('이메일 주소를 입력') || errorMessage.includes('Email is required') || errorMessage.includes('required')) {
        toast.error('❌ 이메일 주소를 입력해주세요.', {
          duration: 5000,
          icon: '❌',
        });
      } else if (errorMessage.includes('접근 권한') || errorMessage.includes('permission') || errorMessage.includes('access')) {
        toast.error('❌ 팀 초대 권한이 없습니다. OWNER 또는 ADMIN만 초대할 수 있습니다.', {
          duration: 5000,
          icon: '❌',
        });
      } else if (errorMessage.includes('데이터베이스') || errorMessage.includes('Database') || errorMessage.includes('constraint')) {
        toast.error('❌ 중복된 초대가 있습니다. 잠시 후 다시 시도해주세요.', {
          duration: 5000,
          icon: '❌',
        });
      } else {
        toast.error(`❌ 오류 발생: ${errorMessage}`, {
          duration: 5000,
          icon: '❌',
        });
      }
    } finally {
      console.log('✅ [STATE] isSendingInvite를 false로 리셋');
      setIsSendingInvite(false);
    }
  };

  const handleCancelInvite = async (inviteId) => {
    try {
      await api.cancelTeamInvite(id, inviteId);
      setInvites(invites.filter(i => i.id !== inviteId));
      toast.success('Invitation cancelled');
    } catch (error) {
      toast.error('Failed to cancel invitation');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await api.removeTeamMember(id, userId);
      setMembers(members.filter(m => m.userId !== userId));
      toast.success('Member removed');
    } catch (error) {
      toast.error(error.message || 'Failed to remove member');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.updateMemberRole(id, userId, newRole);
      setMembers(members.map(m => 
        m.userId === userId ? { ...m, role: newRole } : m
      ));
      toast.success('Role updated');
    } catch (error) {
      toast.error(error.message || 'Failed to update role');
    }
  };

  const handleDeleteTeam = async () => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;

    try {
      await api.deleteTeam(id);
      toast.success('Team deleted');
      router.push('/teams');
    } catch (error) {
      toast.error(error.message || 'Failed to delete team');
    }
  };

  const handleCreateProject = async (data) => {
    try {
      const newProject = await api.createProject({
        ...data,
        teamId: id
      });
      // Refresh team data to get updated projects
      const updatedTeam = await api.getTeam(id);
      setTeam(updatedTeam);
      setIsProjectModalOpen(false);
      projectForm.reset();
      toast.success('Project created successfully');
      // Navigate to the new project
      router.push(`/projects/${newProject.id}/kanban`);
    } catch (error) {
      toast.error(error.message || 'Failed to create project');
    }
  };

  // Permission checks
  const isOwner = userRole === 'OWNER';
  const isAdmin = userRole === 'ADMIN';
  const isMember = userRole === 'MEMBER';
  // OWNER and ADMIN can invite/manage members (Google 로그인 사용자 포함)
  const canManageMembers = isOwner || isAdmin;
  const canEditTeam = isOwner; // Only OWNER can edit team name
  const canDeleteTeam = isOwner; // Only OWNER can delete team
  const canChangeRoles = isOwner; // Only OWNER can change member roles

  // Debug: Log permission status
  console.log('🔐 Permission Debug:', {
    userRole,
    isOwner,
    isAdmin,
    isMember,
    canManageMembers,
    userProvider,
    currentUserId
  });

  if (loading || !team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="secondary" size="sm" onClick={() => router.push('/teams')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teams
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{team.name}</h1>
              <p className="text-gray-600 mt-1">Team Management</p>
            </div>
            <div className="flex gap-2">
              {/* Invite Member Button - OWNER and ADMIN can invite */}
              {canManageMembers ? (
                <Button onClick={() => setIsInviteModalOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              ) : (
                // Debug: Show why button is hidden
                process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-gray-400 p-2">
                    Debug: canManageMembers={String(canManageMembers)}, userRole={userRole || 'null'}
                  </div>
                )
              )}
              {/* Settings Button - Only OWNER can access settings (edit/delete team) */}
              {canEditTeam && (
                <Button variant="secondary" onClick={() => setIsSettingsModalOpen(true)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Members Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Members ({members.length})
                </h2>
              </div>

              <div className="space-y-3">
                {members.map(member => {
                  const isCurrentUser = member.user.id === currentUserId;
                  const isTeamOwner = team.ownerId === member.user.id;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {member.user.avatar ? (
                          <img
                            src={member.user.avatar}
                            alt={member.user.name}
                            className="w-10 h-10 rounded-full object-cover"
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
                          className={`w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium ${
                            member.user.avatar ? 'hidden' : ''
                          }`}
                        >
                          {getInitials(member.user.name || 'U')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{member.user.name}</p>
                            {isTeamOwner && <Crown className="w-4 h-4 text-yellow-500" />}
                            {member.role === 'ADMIN' && <Shield className="w-4 h-4 text-blue-500" />}
                          </div>
                          <p className="text-sm text-gray-500">{member.user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Role selector - Only OWNER can change roles, and cannot change OWNER role */}
                        {canChangeRoles && !isCurrentUser && !isTeamOwner && (
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.user.id, e.target.value)}
                            className="text-sm border rounded px-2 py-1 bg-white"
                            title="Change member role"
                          >
                            <option value="MEMBER">Member</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        )}
                        {/* Role badge display */}
                        {isTeamOwner ? (
                          <span className="text-sm text-yellow-600 px-2 py-1 bg-yellow-50 rounded flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Owner
                          </span>
                        ) : member.role === 'ADMIN' ? (
                          <span className="text-sm text-blue-600 px-2 py-1 bg-blue-50 rounded flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500 px-2 py-1">Member</span>
                        )}
                        {/* Remove button - Only OWNER can remove members, cannot remove OWNER or self */}
                        {canChangeRoles && !isCurrentUser && !isTeamOwner && (
                          <button
                            onClick={() => handleRemoveMember(member.user.id)}
                            className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Projects Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Projects ({team.projects?.length || 0})</h2>
                <Button onClick={() => setIsProjectModalOpen(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </div>
              {team.projects && team.projects.length > 0 ? (
                <div className="space-y-2">
                  {team.projects.map(project => (
                    <a
                      key={project.id}
                      href={`/projects/${project.id}/kanban`}
                      className="block p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-gray-500">{project._count?.issues || 0} issues</p>
                        </div>
                        <FolderKanban className="w-5 h-5 text-gray-400" />
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FolderKanban className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 mb-4">No projects yet</p>
                  <Button onClick={() => setIsProjectModalOpen(true)} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Project
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4">Team Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Owner</p>
                  <p className="font-medium">{team.owner?.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="font-medium">
                    {new Date(team.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Your Role</p>
                  <p className="font-medium flex items-center gap-1">
                    {userRole === 'OWNER' && <Crown className="w-4 h-4 text-yellow-500" />}
                    {userRole === 'ADMIN' && <Shield className="w-4 h-4 text-blue-500" />}
                    {userRole === 'MEMBER' && <UserIcon className="w-4 h-4 text-gray-500" />}
                    <span>{TEAM_ROLES[userRole] || userRole || 'Unknown'}</span>
                  </p>
                </div>
                {/* Permission Summary */}
                {userRole && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Your Permissions:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {isOwner && (
                        <>
                          <li className="flex items-center gap-1">
                            <span className="text-green-600">✓</span> Edit team name
                          </li>
                          <li className="flex items-center gap-1">
                            <span className="text-green-600">✓</span> Delete team
                          </li>
                          <li className="flex items-center gap-1">
                            <span className="text-green-600">✓</span> Invite members
                          </li>
                          <li className="flex items-center gap-1">
                            <span className="text-green-600">✓</span> Change member roles
                          </li>
                          <li className="flex items-center gap-1">
                            <span className="text-green-600">✓</span> Remove members
                          </li>
                        </>
                      )}
                      {isAdmin && !isOwner && (
                        <>
                          <li className="flex items-center gap-1">
                            <span className="text-green-600">✓</span> Invite members
                          </li>
                          <li className="flex items-center gap-1">
                            <span className="text-gray-400">✗</span> Edit team name
                          </li>
                          <li className="flex items-center gap-1">
                            <span className="text-gray-400">✗</span> Change member roles
                          </li>
                          <li className="flex items-center gap-1">
                            <span className="text-gray-400">✗</span> Remove members
                          </li>
                        </>
                      )}
                      {isMember && !isAdmin && !isOwner && (
                        <>
                          <li className="flex items-center gap-1">
                            <span className="text-green-600">✓</span> View team
                          </li>
                          <li className="flex items-center gap-1">
                            <span className="text-green-600">✓</span> Create projects
                          </li>
                          <li className="flex items-center gap-1">
                            <span className="text-gray-400">✗</span> Invite members
                          </li>
                          <li className="flex items-center gap-1">
                            <span className="text-gray-400">✗</span> Manage members
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Pending Invites */}
            {canManageMembers && invites.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Pending Invites
                </h3>
                <div className="space-y-2">
                  {invites.map(invite => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-2 border rounded text-sm"
                    >
                      <div>
                        <p className="font-medium">{invite.email}</p>
                        <p className="text-xs text-gray-500">{invite.role}</p>
                      </div>
                      <button
                        onClick={() => handleCancelInvite(invite.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => {
          if (!isSendingInvite) {
            setIsInviteModalOpen(false);
            inviteForm.reset();
          }
        }}
        title="Invite Team Member"
        canClose={!isSendingInvite}
      >
        <form 
          onSubmit={inviteForm.handleSubmit(
            (data) => {
              console.log('📝 [INVITE FORM] Form submit 이벤트 발생, 데이터:', data);
              handleInvite(data);
            },
            (errors) => {
              // 에러 객체를 JSON으로 변환하여 상세 정보 확인
              const errorString = JSON.stringify(errors, null, 2);
              console.error('❌ [INVITE FORM] Validation 에러 상세:', errorString);
              console.error('❌ [INVITE FORM] Validation 에러 객체:', errors);
              console.error('❌ [INVITE FORM] 에러 키들:', Object.keys(errors));
              
              // 각 필드별 에러 확인
              Object.keys(errors).forEach(key => {
                console.error(`   - ${key}:`, errors[key]);
              });
              
              // 구체적인 에러 메시지 표시
              if (errors.email) {
                const emailError = errors.email;
                const errorMessage = emailError.message || 
                                   (emailError.type === 'required' ? '이메일 주소를 입력해주세요.' : 
                                    emailError.type === 'pattern' ? '유효하지 않은 이메일 주소입니다.' : 
                                    '이메일 주소를 확인해주세요.');
                console.error('   이메일 에러 상세:', {
                  message: errorMessage,
                  type: emailError.type,
                  ref: emailError.ref?.value
                });
                toast.error(`이메일: ${errorMessage}`, { duration: 5000 });
              } else if (errors.role) {
                const roleError = errors.role;
                const errorMessage = roleError.message || '역할을 선택해주세요.';
                console.error('   역할 에러 상세:', roleError);
                toast.error(`역할: ${errorMessage}`, { duration: 5000 });
              } else {
                // 모든 에러 필드 출력
                const errorMessages = Object.keys(errors).map(key => {
                  const err = errors[key];
                  return `${key}: ${err.message || err.type || '에러'}`;
                }).join(', ');
                console.error('   알 수 없는 validation 에러 필드들:', errorMessages);
                toast.error(`입력 오류: ${errorMessages || '입력 정보를 확인해주세요.'}`, { duration: 5000 });
              }
            }
          )} 
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <Input
              type="email"
              {...inviteForm.register('email', {
                required: '이메일 주소를 입력해주세요.',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: '유효하지 않은 이메일 주소입니다.'
                }
              })}
              placeholder="user@example.com"
              disabled={isSendingInvite}
            />
            {inviteForm.formState.errors.email && (
              <p className="text-red-500 text-sm mt-1">{inviteForm.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              {...inviteForm.register('role')}
              className="input"
              defaultValue="MEMBER"
              disabled={isSendingInvite}
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsInviteModalOpen(false);
                reset();
              }}
              disabled={isSendingInvite}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSendingInvite}
              onClick={(e) => {
                console.log('🖱️ [BUTTON] Send 버튼 클릭:', {
                  isSendingInvite,
                  disabled: isSendingInvite,
                  timestamp: new Date().toISOString(),
                  type: e.target.type,
                  formId: e.target.form?.id
                });
                // disabled 상태가 아니면 폼 제출 허용 (preventDefault 호출 안 함)
                if (isSendingInvite) {
                  e.preventDefault();
                  e.stopPropagation();
                  console.warn('⚠️ 버튼이 disabled 상태입니다. 클릭 무시됨.');
                } else {
                  console.log('✅ 버튼 클릭 허용, 폼 제출 진행');
                }
              }}
              className={isSendingInvite ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}
            >
              {isSendingInvite ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  발송 중...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => {
          setIsSettingsModalOpen(false);
          teamSettingsForm.reset();
        }}
        title="Team Settings"
      >
        <div className="space-y-6">
          {/* Edit Team Name */}
          <div>
            <h3 className="font-semibold mb-4">Edit Team</h3>
            <form onSubmit={teamSettingsForm.handleSubmit(async (data) => {
              try {
                const updated = await api.updateTeam(id, { name: data.name });
                setTeam(updated);
                setIsSettingsModalOpen(false);
                teamSettingsForm.reset();
                toast.success('Team updated successfully');
              } catch (error) {
                toast.error(error.message || 'Failed to update team');
              }
            })} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name *
                </label>
                <Input
                  {...teamSettingsForm.register('name', { required: 'Team name is required' })}
                  defaultValue={team.name}
                  placeholder="Enter team name"
                />
                {teamSettingsForm.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">{teamSettingsForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsSettingsModalOpen(false);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="border-t pt-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-700 mb-4">
                Once you delete a team, there is no going back. Please be certain.
              </p>
              <Button variant="danger" onClick={handleDeleteTeam}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Team
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Project Creation Modal */}
      <Modal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          projectForm.reset();
        }}
        title="Create New Project"
      >
        <ProjectForm
          teams={team ? [{ id, name: team.name }] : []}
          defaultTeamId={id}
          onSubmit={handleCreateProject}
          onCancel={() => {
            setIsProjectModalOpen(false);
            projectForm.reset();
          }}
        />
      </Modal>
    </div>
  );
}
