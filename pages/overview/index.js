// pages/overview/index.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { api } from '../../utils/api';
import { Search, Filter, Grid, List } from 'lucide-react';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import TeamCard from '../../components/lists/TeamCard';
import ProjectCard from '../../components/lists/ProjectCard';
import EmptyState from '../../components/ui/EmptyState';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

export default function OverviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'teams', 'projects'
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, session, router]);

  const fetchData = async () => {
    try {
      const [teamsData, projectsData] = await Promise.all([
        api.getTeams().catch(() => []),
        api.getProjects().catch(() => [])
      ]);
      setTeams(teamsData || []);
      setProjects(projectsData || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.team?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Teams & Projects</h1>
              <p className="text-gray-600 mt-1">Overview of all your teams and projects</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search teams and projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('teams')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    filter === 'teams'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Teams
                </button>
                <button
                  onClick={() => setFilter('projects')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    filter === 'projects'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Projects
                </button>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Teams Section */}
        {(filter === 'all' || filter === 'teams') && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">
                Teams ({filteredTeams.length})
              </h2>
              <Button onClick={() => router.push('/teams')} variant="secondary" size="sm">
                View All Teams
              </Button>
            </div>
            {filteredTeams.length === 0 ? (
              <EmptyState
                title="No teams found"
                description={searchQuery ? "Try adjusting your search" : "Create your first team to get started"}
                actionLabel={!searchQuery ? "Create Team" : null}
                onAction={!searchQuery ? () => router.push('/teams') : null}
              />
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeams.map(team => (
                  <TeamCard key={team.id} team={team} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y">
                {filteredTeams.map(team => (
                  <div key={team.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{team.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {team._count?.members || 0} members • {team._count?.projects || 0} projects
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push(`/teams/${team.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Projects Section */}
        {(filter === 'all' || filter === 'projects') && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">
                Projects ({filteredProjects.length})
              </h2>
              <Button onClick={() => router.push('/projects')} variant="secondary" size="sm">
                View All Projects
              </Button>
            </div>
            {filteredProjects.length === 0 ? (
              <EmptyState
                title="No projects found"
                description={searchQuery ? "Try adjusting your search" : "Create your first project to get started"}
                actionLabel={!searchQuery ? "Create Project" : null}
                onAction={!searchQuery ? () => router.push('/projects') : null}
              />
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y">
                {filteredProjects.map(project => (
                  <div key={project.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {project.team?.name} • {project._count?.issues || 0} issues
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.push(`/projects/${project.id}/kanban`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

