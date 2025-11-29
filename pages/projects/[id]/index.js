// pages/projects/[id]/index.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { api } from '../../../utils/api';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import ProjectForm from '../../../components/forms/ProjectForm';
import Loading from '../../../components/ui/Loading';
import ErrorDisplay from '../../../components/ui/ErrorDisplay';
import { 
  FolderKanban, 
  Settings, 
  Edit, 
  Trash2, 
  Users, 
  AlertCircle,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../../lib/utils';
import Link from 'next/link';

export default function ProjectDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState(null);
  const [teams, setTeams] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && id) {
      fetchData();
    }
  }, [status, session, id, router]);

  useEffect(() => {
    if (project && session?.user) {
      const isOwner = project.ownerId === session.user.id;
      setCanDelete(isOwner);
      
      // For edit permission, check if user is owner or team admin
      if (isOwner) {
        setCanEdit(true);
      } else if (project.team) {
        // Try to get team members to check role
        api.getTeamMembers(project.team.id)
          .then(members => {
            const userMember = members.find(m => m.userId === session.user.id);
            if (userMember && ['OWNER', 'ADMIN'].includes(userMember.role)) {
              setCanEdit(true);
            }
          })
          .catch(() => {
            // If team members fetch fails, only owner can edit
            setCanEdit(isOwner);
          });
      } else {
        setCanEdit(isOwner);
      }
    }
  }, [project, session]);

  const fetchData = async () => {
    setError(null);
    setLoading(true);
    try {
      const [projectData, teamsData, issuesData] = await Promise.all([
        api.getProject(id),
        api.getTeams().catch(() => []),
        api.getIssues(id).catch(() => [])
      ]);

      // Get team members if team exists
      if (projectData.team) {
        try {
          const teamData = await api.getTeam(projectData.team.id);
          projectData.team = {
            ...projectData.team,
            _count: teamData._count || { members: 0 }
          };
        } catch (err) {
          console.error('Failed to load team details:', err);
        }
      }

      setProject(projectData);
      setTeams(teamsData);
      setIssues(issuesData || []);
    } catch (err) {
      const errorMessage = err?.message || 'Failed to load project';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    try {
      const updated = await api.updateProject(id, data);
      setProject(updated);
      setIsEditModalOpen(false);
      toast.success('Project updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update project');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.deleteProject(id);
      toast.success('Project deleted successfully');
      router.push('/projects');
    } catch (error) {
      toast.error(error.message || 'Failed to delete project');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading text="Loading project..." />
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full">
          <ErrorDisplay 
            error={error} 
            onRetry={fetchData}
            title="Failed to load project"
          />
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/projects">
              <Button variant="secondary" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold">{project.name}</h1>
                {project.isArchived && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                    Archived
                  </span>
                )}
              </div>
              {project.description && (
                <p className="text-gray-600 text-sm sm:text-base">{project.description}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {canEdit && (
                <Button
                  variant="secondary"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="danger"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
              <Link href={`/projects/${id}/kanban`}>
                <Button>
                  <FolderKanban className="w-4 h-4 mr-2" />
                  Kanban Board
                </Button>
              </Link>
              <Link href={`/projects/${id}/settings`}>
                <Button variant="secondary">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <ErrorDisplay 
            error={error} 
            onRetry={fetchData}
            variant="banner"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Project Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-900 mt-1">
                    {project.description || <span className="text-gray-400">No description</span>}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">생성일</label>
                    <p className="text-gray-900 mt-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {project.createdAt ? formatDate(project.createdAt) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">수정일</label>
                    <p className="text-gray-900 mt-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {project.updatedAt ? formatDate(project.updatedAt) : (project.createdAt ? formatDate(project.createdAt) : 'N/A')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Issues */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Issues</h2>
                <Link href={`/projects/${id}/kanban`}>
                  <Button variant="secondary" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              {issues.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No issues yet</p>
                  <Link href={`/projects/${id}/kanban`}>
                    <Button variant="secondary" size="sm" className="mt-4">
                      Create Issue
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {issues.slice(0, 5).map(issue => (
                    <Link
                      key={issue.id}
                      href={`/issues/${issue.id}`}
                      className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{issue.title}</h3>
                          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              issue.status === 'Done' ? 'bg-green-100 text-green-800' :
                              issue.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {issue.status}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              issue.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                              issue.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {issue.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Info */}
            {project.team && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-600" />
                  Team
                </h3>
                <Link href={`/teams/${project.team.id}`}>
                  <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <p className="font-medium">{project.team.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {project.team._count?.members || 0} members
                    </p>
                  </div>
                </Link>
              </div>
            )}

            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Issues</span>
                  <span className="font-semibold">{project._count?.issues || issues.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Labels</span>
                  <span className="font-semibold">{project._count?.labels || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Custom States</span>
                  <span className="font-semibold">{project._count?.customStates || 0}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href={`/projects/${id}/kanban`} className="block">
                  <Button variant="secondary" className="w-full justify-start">
                    <FolderKanban className="w-4 h-4 mr-2" />
                    View Kanban Board
                  </Button>
                </Link>
                <Link href={`/projects/${id}/settings`} className="block">
                  <Button variant="secondary" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Project Settings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Project"
      >
        <ProjectForm
          teams={teams}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
          initialData={project}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Project"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{project.name}</strong>? 
            This action cannot be undone and will delete all associated issues, labels, and custom states.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
