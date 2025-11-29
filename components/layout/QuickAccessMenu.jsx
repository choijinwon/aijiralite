// components/layout/QuickAccessMenu.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Users, 
  FolderKanban, 
  ChevronDown, 
  Search,
  Plus,
  ArrowRight
} from 'lucide-react';
import { api } from '../../utils/api';
import Loading from '../ui/Loading';

export default function QuickAccessMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teamsData, projectsData] = await Promise.all([
        api.getTeams().catch(() => []),
        api.getProjects().catch(() => [])
      ]);
      setTeams(teamsData || []);
      setProjects(projectsData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
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

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
          router.pathname.startsWith('/teams') || router.pathname.startsWith('/projects')
            ? 'bg-primary-50 text-primary-700'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
        title="Quick access to teams and projects"
      >
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        <span className="hidden xl:inline">Quick Access</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Quick Access</h3>
                <Link
                  href="/overview"
                  className="text-sm text-primary-600 hover:text-primary-700"
                  onClick={() => setIsOpen(false)}
                >
                  View All
                </Link>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search teams and projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 flex justify-center">
                  <Loading size="sm" />
                </div>
              ) : (
                <>
                  {/* Teams Section */}
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <h4 className="font-medium text-gray-900">Teams ({filteredTeams.length})</h4>
                      </div>
                      <Link
                        href="/teams"
                        className="text-xs text-primary-600 hover:text-primary-700"
                        onClick={() => setIsOpen(false)}
                      >
                        View All
                      </Link>
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {filteredTeams.length === 0 ? (
                        <p className="text-sm text-gray-500 py-2">No teams found</p>
                      ) : (
                        filteredTeams.slice(0, 5).map(team => (
                          <Link
                            key={team.id}
                            href={`/teams/${team.id}`}
                            className="block p-2 rounded hover:bg-gray-50 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {team.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {team._count?.members || 0} members • {team._count?.projects || 0} projects
                                </p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                    {filteredTeams.length > 5 && (
                      <Link
                        href="/teams"
                        className="block mt-2 text-xs text-primary-600 hover:text-primary-700 text-center"
                        onClick={() => setIsOpen(false)}
                      >
                        View {filteredTeams.length - 5} more teams
                      </Link>
                    )}
                  </div>

                  {/* Projects Section */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="w-4 h-4 text-gray-500" />
                        <h4 className="font-medium text-gray-900">Projects ({filteredProjects.length})</h4>
                      </div>
                      <Link
                        href="/projects"
                        className="text-xs text-primary-600 hover:text-primary-700"
                        onClick={() => setIsOpen(false)}
                      >
                        View All
                      </Link>
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {filteredProjects.length === 0 ? (
                        <p className="text-sm text-gray-500 py-2">No projects found</p>
                      ) : (
                        filteredProjects.slice(0, 5).map(project => (
                          <Link
                            key={project.id}
                            href={`/projects/${project.id}/kanban`}
                            className="block p-2 rounded hover:bg-gray-50 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {project.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {project.team?.name} • {project._count?.issues || 0} issues
                                </p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                    {filteredProjects.length > 5 && (
                      <Link
                        href="/projects"
                        className="block mt-2 text-xs text-primary-600 hover:text-primary-700 text-center"
                        onClick={() => setIsOpen(false)}
                      >
                        View {filteredProjects.length - 5} more projects
                      </Link>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex gap-2">
                <Link
                  href="/teams"
                  className="flex-1 px-3 py-2 text-sm font-medium text-center text-primary-600 bg-white border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  New Team
                </Link>
                <Link
                  href="/projects"
                  className="flex-1 px-3 py-2 text-sm font-medium text-center text-primary-600 bg-white border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  New Project
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

