// pages/projects/[id]/kanban.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { api } from '../../../utils/api';
import KanbanBoard from '../../../components/kanban/KanbanBoard';
import Modal from '../../../components/ui/Modal';
import IssueForm from '../../../components/issue/IssueForm';
import Button from '../../../components/ui/Button';
import Loading from '../../../components/ui/Loading';
import ErrorDisplay from '../../../components/ui/ErrorDisplay';
import { Plus, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export default function KanbanPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = router.query;
  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [labels, setLabels] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session || !id) return;

    const fetchData = async () => {
      setError(null);
      setLoading(true);
      try {
        const [projectData, issuesData, labelsData] = await Promise.all([
          api.getProject(id),
          api.getIssues(id),
          api.getLabels(id)
        ]);
        setProject(projectData);
        setIssues(issuesData);
        setLabels(labelsData);

        // Get team members for assignee dropdown
        if (projectData.team) {
          const team = await api.getTeam(projectData.team.id);
          setUsers(team.members.map(m => m.user));
        }
      } catch (err) {
        const errorMessage = err?.message || 'Failed to load project';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, id, router]);

  const handleRetry = async () => {
    if (id) {
      const fetchData = async () => {
        setError(null);
        setLoading(true);
        try {
          const [projectData, issuesData, labelsData] = await Promise.all([
            api.getProject(id),
            api.getIssues(id),
            api.getLabels(id)
          ]);
          setProject(projectData);
          setIssues(issuesData);
          setLabels(labelsData);

          if (projectData.team) {
            const team = await api.getTeam(projectData.team.id);
            setUsers(team.members.map(m => m.user));
          }
        } catch (err) {
          const errorMessage = err?.message || 'Failed to load project';
          setError(errorMessage);
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      };
      await fetchData();
    }
  };

  const handleCreateIssue = async (data) => {
    try {
      const newIssue = await api.createIssue({
        ...data,
        projectId: id,
        status: data.status || 'Backlog'
      });
      
      // Refresh issues to get the complete data including labels
      const updatedIssues = await api.getIssues(id);
      setIssues(updatedIssues);
      setIsFormOpen(false);
      toast.success('Issue created successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to create issue');
    }
  };

  if (loading || !project) {
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
            onRetry={handleRetry}
            title="Failed to load project"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{project.name}</h1>
              <p className="text-gray-600 text-sm sm:text-base">Kanban Board</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="secondary"
                onClick={() => router.push(`/projects/${id}/settings`)}
                className="flex-1 sm:flex-initial"
              >
                <Settings className="w-4 h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-base">Settings</span>
              </Button>
              <Button onClick={() => setIsFormOpen(true)} className="flex-1 sm:flex-initial">
                <Plus className="w-4 h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                <span className="text-xs sm:text-base">
                  <span className="sm:hidden">New</span>
                  <span className="hidden sm:inline">New Issue</span>
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <ErrorDisplay 
            error={error} 
            onRetry={handleRetry}
            variant="banner"
          />
        </div>
      )}
      
      <KanbanBoard
        project={project}
        issues={issues}
        onIssuesChange={setIssues}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Create Issue"
      >
        <IssueForm
          project={project}
          users={users}
          labels={labels}
          onSubmit={handleCreateIssue}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>
    </div>
  );
}
