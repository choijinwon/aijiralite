// pages/teams/[id]/index.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { api } from '../../../utils/api';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import { Users, Mail, UserPlus, Settings, Trash2, Crown, Shield, User as UserIcon, X, Plus, FolderKanban, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema } from '../../../lib/validations';
import { TEAM_ROLES } from '../../../utils/constants';
import { getInitials } from '../../../lib/utils';
import ProjectForm from '../../../components/forms/ProjectForm';

export default function TeamDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const projectForm = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: '', description: '', teamId: id }
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && id) {
      fetchTeamData();
    }
  }, [status, session, id, router]);

  const fetchTeamData = async () => {
    try {
      const [teamData, membersData, invitesData] = await Promise.all([
        api.getTeam(id),
        api.getTeamMembers(id),
        api.getTeamInvites(id).catch(() => []) // Invites might fail if not admin
      ]);

      setTeam(teamData);
      setMembers(membersData);
      setInvites(invitesData || []);

      // Find current user's role
      const currentUserMember = membersData.find(m => m.user.id === session?.user?.id);
      if (teamData.ownerId === session?.user?.id) {
        setUserRole('OWNER');
      } else if (currentUserMember) {
        setUserRole(currentUserMember.role);
      } else {
        setUserRole(null);
      }
      
      // Debug: Log role information
      console.log('Team Role Debug:', {
        userId: session?.user?.id,
        teamOwnerId: teamData.ownerId,
        currentUserMember: currentUserMember,
        userRole: teamData.ownerId === session?.user?.id ? 'OWNER' : (currentUserMember?.role || null)
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
    try {
      const invite = await api.createTeamInvite(id, data.email, data.role || 'MEMBER');
      setInvites([invite, ...invites]);
      setIsInviteModalOpen(false);
      reset();
      toast.success('Invitation sent successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to send invitation');
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
  const canManageMembers = isOwner || isAdmin; // OWNER and ADMIN can invite/manage members
  const canEditTeam = isOwner; // Only OWNER can edit team name
  const canDeleteTeam = isOwner; // Only OWNER can delete team
  const canChangeRoles = isOwner; // Only OWNER can change member roles

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
              {canManageMembers && (
                <Button onClick={() => setIsInviteModalOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
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
                  const isCurrentUser = member.user.id === session?.user?.id;
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
          setIsInviteModalOpen(false);
          reset();
        }}
        title="Invite Team Member"
      >
        <form onSubmit={handleSubmit(handleInvite)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <Input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              placeholder="user@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              {...register('role')}
              className="input"
              defaultValue="MEMBER"
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
            >
              Cancel
            </Button>
            <Button type="submit">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => {
          setIsSettingsModalOpen(false);
          reset();
        }}
        title="Team Settings"
      >
        <div className="space-y-6">
          {/* Edit Team Name */}
          <div>
            <h3 className="font-semibold mb-4">Edit Team</h3>
            <form onSubmit={handleSubmit(async (data) => {
              try {
                const updated = await api.updateTeam(id, { name: data.name });
                setTeam(updated);
                setIsSettingsModalOpen(false);
                reset();
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
                  {...register('name', { required: 'Team name is required' })}
                  defaultValue={team.name}
                  placeholder="Enter team name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
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
