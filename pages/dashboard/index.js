// pages/dashboard/index.js
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
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
  const { user: supabaseUser, loading: supabaseLoading } = useSupabaseAuth();
  const router = useRouter();
  const isMountedRef = useRef(true);
  const fetchControllerRef = useRef(null);
  const redirectingRef = useRef(false);
  const authCheckedRef = useRef(false);
  
  // Use Supabase user if available, otherwise use NextAuth session
  const currentUser = supabaseUser || session?.user;
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

  // Authentication check effect - separate from data fetching
  useEffect(() => {
    // Wait for router to be ready and prevent multiple redirects
    if (!router.isReady || redirectingRef.current) return;

    // Check both NextAuth and Supabase auth
    const isAuthenticated = (status === 'authenticated' && session) || supabaseUser;
    const isLoading = status === 'loading' || supabaseLoading;

    // Mark that we've checked auth
    authCheckedRef.current = true;

    if (!isLoading && !isAuthenticated) {
      // Prevent multiple redirects
      if (redirectingRef.current) return;
      redirectingRef.current = true;
      
      // Use a small delay to ensure router is ready for navigation
      // This prevents the abort error during component loading
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          router.replace('/auth/signin');
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [router.isReady, status, session, supabaseUser, supabaseLoading, router]);

  // Data fetching effect - separate from auth check
  const fetchData = useCallback(async () => {
    // Cancel any ongoing fetch
    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }

    // Create new AbortController for this fetch
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    setError(null);
    setLoading(true);
    
    try {
      // First, load stats immediately (most important)
      const statsData = await api.getDashboardStats(dashboardType);
      
      // Check if component is still mounted and fetch wasn't cancelled
      if (!isMountedRef.current || controller.signal.aborted) {
        return;
      }

      // Set stats first so user sees something quickly
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

      // Then load other data in parallel (less critical)
      // These can load in the background
      Promise.all([
        api.getTeams().catch(() => []),
        api.getProjects().catch(() => []),
        api.getIssues().catch(() => [])
      ]).then(([teamsData, projectsData, issuesData]) => {
        // Check again if component is still mounted
        if (!isMountedRef.current || controller.signal.aborted) {
          return;
        }
        
        setTeams(teamsData || []);
        setProjects(projectsData || []);
        setIssues(issuesData || []);
      }).catch(() => {
        // Silently fail for secondary data
        if (isMountedRef.current && !controller.signal.aborted) {
          setTeams([]);
          setProjects([]);
          setIssues([]);
        }
      });

      // Set loading to false after stats are loaded
      if (isMountedRef.current && !controller.signal.aborted) {
        setLoading(false);
      }
    } catch (err) {
      // Don't set error if fetch was aborted or component unmounted
      if (!isMountedRef.current || controller.signal.aborted) {
        return;
      }
      
      // Ignore abort errors
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        return;
      }

      const errorMessage = err?.message || 'Failed to load dashboard';
      setError(errorMessage);
      toast.error(errorMessage);
      
      if (isMountedRef.current && !controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [dashboardType]);

  // Fetch data when authenticated and dashboard type changes
  useEffect(() => {
    if (!router.isReady || redirectingRef.current) return;

    const isAuthenticated = (status === 'authenticated' && session) || supabaseUser;
    const isLoading = status === 'loading' || supabaseLoading;

    // Only fetch if we've checked auth and user is authenticated
    if (authCheckedRef.current && !isLoading && isAuthenticated) {
      fetchData();
    }
  }, [router.isReady, status, session, supabaseUser, supabaseLoading, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      redirectingRef.current = true; // Prevent any redirects during unmount
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
      }
    };
  }, []);

  const handleRetry = async () => {
    setRetrying(true);
    await fetchData();
    setRetrying(false);
  };

  if (status === 'loading' || supabaseLoading || (loading && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading text="Loading dashboard..." />
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  // Ensure stats has default values
  const safeStats = stats || {
    totalIssues: 0,
    totalProjects: 0,
    totalMembers: 0,
    totalTeams: 0,
    overdueIssues: 0,
    statusCounts: {},
    priorityCounts: {},
    dailyTrend: []
  };

  const myIssues = issues.filter(i => i.assigneeId === currentUser?.id);
  const recentProjects = projects.slice(0, 5);
  const recentIssues = myIssues.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">Welcome back, {currentUser?.name || currentUser?.email}</p>
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
            value={safeStats.totalIssues || 0}
            subtitle={dashboardType === 'personal' ? 'Assigned to you' : 'All team issues'}
            icon={AlertCircle}
          />
          <StatCard
            title={dashboardType === 'personal' ? 'My Projects' : 'Team Projects'}
            value={safeStats.totalProjects || 0}
            subtitle={dashboardType === 'personal' ? 'Your projects' : 'All team projects'}
            icon={FolderKanban}
          />
          {dashboardType === 'team' && (
            <StatCard
              title="Team Members"
              value={safeStats.totalMembers || 0}
              subtitle="Active members"
              icon={Users}
            />
          )}
          {dashboardType === 'team' && (
            <StatCard
              title="Teams"
              value={safeStats.totalTeams || 0}
              subtitle="Your teams"
              icon={Users}
            />
          )}
          <StatCard
            title="Overdue Issues"
            value={safeStats.overdueIssues || 0}
            subtitle="Past due date"
            icon={Calendar}
            trend={(safeStats.overdueIssues || 0) > 0 ? 1 : 0}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Issue Status Chart */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Issues by Status</h3>
            <IssueStatusChart data={safeStats.statusCounts || {}} />
          </Card>

          {/* Priority Chart */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Issues by Priority</h3>
            <PriorityChart data={safeStats.priorityCounts || {}} />
          </Card>
        </div>

        {/* Trend Chart */}
        <div className="mb-8">
          <Card>
            <h3 className="text-lg font-semibold mb-4">Issue Trend (Last 7 Days)</h3>
            <IssueTrendChart data={safeStats.dailyTrend || []} />
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
