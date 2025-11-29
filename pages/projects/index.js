// pages/projects/index.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { api } from '../../utils/api';
import Link from 'next/link';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { Plus, FolderKanban } from 'lucide-react';
import toast from 'react-hot-toast';
import ProjectForm from '../../components/forms/ProjectForm';
import ProjectCard from '../../components/lists/ProjectCard';
import EmptyState from '../../components/ui/EmptyState';
import Loading from '../../components/ui/Loading';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import PageLoader from '../../components/ui/PageLoader';

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const { user: supabaseUser, loading: supabaseLoading } = useSupabaseAuth();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (isAuthenticated && !isLoading) {
      fetchData();
    }
  }, [router.isReady, status, session, supabaseUser, supabaseLoading, router]);

  const [error, setError] = useState(null);

  const fetchData = async () => {
    setError(null);
    setLoading(true);
    try {
      const [projectsData, teamsData] = await Promise.all([
        api.getProjects(),
        api.getTeams()
      ]);
      setProjects(projectsData);
      setTeams(teamsData);
    } catch (err) {
      const errorMessage = err?.message || 'Failed to load data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const newProject = await api.createProject(data);
      setProjects([newProject, ...projects]);
      setIsFormOpen(false);
      toast.success('Project created successfully');
      router.push(`/projects/${newProject.id}/kanban`);
    } catch (error) {
      toast.error(error.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader variant="skeleton" count={6} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Projects</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">All your projects</p>
            </div>
            <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {error && (
          <div className="mb-6">
            <ErrorDisplay 
              error={error} 
              onRetry={fetchData}
              title="Failed to load projects"
            />
          </div>
        )}
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description={teams.length > 0 
              ? "Create your first project to get started"
              : "Create a team first, then create a project"}
            actionLabel={teams.length > 0 ? (
              <>
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </>
            ) : null}
            onAction={teams.length > 0 ? () => setIsFormOpen(true) : null}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Create New Project"
      >
        <ProjectForm
          teams={teams}
          onSubmit={onSubmit}
          onCancel={() => setIsFormOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
}

