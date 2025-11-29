// pages/dashboard/index.js
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { api } from '../../utils/api';
import Link from 'next/link';
import { 
  Plus, 
  ArrowRight, 
  User, 
  Users, 
  FolderKanban, 
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import ErrorDisplay from '../../components/ui/ErrorDisplay';
import StatCard from '../../components/dashboard/StatCard';
import IssueStatusChart from '../../components/dashboard/IssueStatusChart';
import PriorityChart from '../../components/dashboard/PriorityChart';
import IssueTrendChart from '../../components/dashboard/IssueTrendChart';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardType, setDashboardType] = useState('personal'); // 'personal' or 'team'
  const [stats, setStats] = useState({
    totalIssues: 0,
    totalProjects: 0,
    totalMembers: 0,
    totalTeams: 0,
    overdueIssues: 0,
    statusCounts: {},
    priorityCounts: {},
    dailyTrend: []
  });
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session) {
      fetchData();
    }
  }, [status, session, router, dashboardType]);

  const fetchData = async () => {
    setError(null);
    setLoading(true);
    try {
      const [statsData, teamsData, projectsData, issuesData] = await Promise.all([
        api.getDashboardStats(dashboardType),
        api.getTeams().catch(() => []),
        api.getProjects().catch(() => []),
        api.getIssues().catch(() => [])
      ]);

      setStats(statsData || {
        totalIssues: 0,
        totalProjects: 0,
        totalMembers: 0,
        totalTeams: 0,
        overdueIssues: 0,
        statusCounts: {},
        priorityCounts: {},
        dailyTrend: []
      });
      setTeams(teamsData || []);
      setProjects(projectsData || []);
      setIssues(issuesData || []);
    } catch (err) {
      const errorMessage = err?.message || 'Failed to load dashboard';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    await fetchData();
    setRetrying(false);
  };

  if (status === 'loading' || (loading && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading text="Loading dashboard..." />
      </div>
    );
  }

  const myIssues = issues.filter(i => i.assigneeId === session?.user?.id);
  const recentProjects = projects.slice(0, 5);
  const recentIssues = myIssues.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Welcome back, {session?.user?.name}</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
                <button
                  onClick={() => setDashboardType('personal')}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium transition-colors ${
                    dashboardType === 'personal'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <User className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Personal</span>
                  <span className="sm:hidden">Me</span>
                </button>
                <button
                  onClick={() => setDashboardType('team')}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium transition-colors ${
                    dashboardType === 'team'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  Team
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {error && (
          <div className="mb-6">
            <ErrorDisplay 
              error={error} 
              onRetry={handleRetry}
              title="Failed to load dashboard"
            />
          </div>
        )}
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title={dashboardType === 'personal' ? 'My Issues' : 'Team Issues'}
            value={stats?.totalIssues || 0}
            subtitle={dashboardType === 'personal' ? 'Assigned to you' : 'All team issues'}
            icon={AlertCircle}
          />
          <StatCard
            title={dashboardType === 'personal' ? 'My Projects' : 'Team Projects'}
            value={stats?.totalProjects || 0}
            subtitle={dashboardType === 'personal' ? 'Your projects' : 'All team projects'}
            icon={FolderKanban}
          />
          {dashboardType === 'team' && (
            <StatCard
              title="Team Members"
              value={stats?.totalMembers || 0}
              subtitle="Active members"
              icon={Users}
            />
          )}
          {dashboardType === 'team' && (
            <StatCard
              title="Teams"
              value={stats?.totalTeams || 0}
              subtitle="Your teams"
              icon={Users}
            />
          )}
          <StatCard
            title="Overdue Issues"
            value={stats?.overdueIssues || 0}
            subtitle="Past due date"
            icon={Calendar}
            trend={(stats?.overdueIssues || 0) > 0 ? 1 : 0}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Issue Status Chart */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Issues by Status</h3>
            <IssueStatusChart data={stats?.statusCounts || {}} />
          </Card>

          {/* Priority Chart */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Issues by Priority</h3>
            <PriorityChart data={stats?.priorityCounts || {}} />
          </Card>
        </div>

        {/* Trend Chart */}
        <div className="mb-8">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Issue Trend (Last 7 Days)</h3>
            <IssueTrendChart data={stats?.dailyTrend || []} />
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Projects</h2>
              <Link href="/projects">
                <Button variant="secondary" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentProjects.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No projects yet</p>
              ) : (
                recentProjects.map(project => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}/kanban`}
                    className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{project.name}</h3>
                        <p className="text-sm text-gray-600">{project.team?.name}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">My Issues</h2>
              <Link href="/issues">
                <Button variant="secondary" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentIssues.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No assigned issues</p>
              ) : (
                recentIssues.map(issue => (
                  <Link
                    key={issue.id}
                    href={`/issues/${issue.id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{issue.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            issue.status === 'Done' ? 'bg-green-100 text-green-800' :
                            issue.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {issue.status}
                          </span>
                          <span className="text-xs text-gray-500">{issue.project?.name}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
