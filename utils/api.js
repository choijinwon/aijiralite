// utils/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function apiRequest(endpoint, options = {}) {
  let token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Try to get NextAuth session if no JWT token
  if (!token && typeof window !== 'undefined') {
    try {
      const { getSession } = await import('next-auth/react');
      const session = await getSession();
      if (session?.user?.id) {
        // NextAuth session exists, but we need to pass it via cookie
        // The cookie will be automatically included in the request
        // We don't need to set Authorization header for NextAuth
      }
    } catch (error) {
      // NextAuth not available, continue
      console.log('NextAuth session check failed:', error.message);
    }
  }
  
  // Try to get Supabase session token if no JWT token
  if (!token && typeof window !== 'undefined') {
    try {
      const { supabase } = await import('../lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        token = session.access_token;
      }
    } catch (error) {
      // Supabase not available, continue with JWT token
      console.log('Supabase session check failed:', error.message);
    }
  }
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    // Include credentials to send cookies (for NextAuth session)
    credentials: 'include',
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    
    // If authentication error, try to redirect to sign in
    if (response.status === 401 && typeof window !== 'undefined') {
      // Don't redirect if we're already on auth pages
      if (!window.location.pathname.startsWith('/auth/')) {
        // Clear any stored tokens
        localStorage.removeItem('token');
        // Redirect will be handled by the component
      }
    }
    
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email, password) => apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  
  register: (data) => apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Teams
  getTeams: () => apiRequest('/api/teams'),
  createTeam: (data) => apiRequest('/api/teams', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getTeam: (id) => apiRequest(`/api/teams/${id}`),
  updateTeam: (id, data) => apiRequest(`/api/teams/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteTeam: (id) => apiRequest(`/api/teams/${id}`, {
    method: 'DELETE',
  }),
  getTeamMembers: (id) => apiRequest(`/api/teams/${id}/members`),
  addTeamMember: (id, userId, role) => apiRequest(`/api/teams/${id}/members`, {
    method: 'POST',
    body: JSON.stringify({ userId, role }),
  }),
  removeTeamMember: (id, userId) => apiRequest(`/api/teams/${id}/members`, {
    method: 'DELETE',
    body: JSON.stringify({ userId }),
  }),
  updateMemberRole: (id, userId, role) => apiRequest(`/api/teams/${id}/members/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }),
  getTeamInvites: (id) => apiRequest(`/api/teams/${id}/invites?t=${Date.now()}`),
  getMyTeamInvite: (id) => apiRequest(`/api/teams/${id}/invites/my-invite?t=${Date.now()}`),
  createTeamInvite: (id, email, role) => apiRequest(`/api/teams/${id}/invites`, {
    method: 'POST',
    body: JSON.stringify({ email, role }),
  }),
  cancelTeamInvite: (id, inviteId) => apiRequest(`/api/teams/${id}/invites`, {
    method: 'DELETE',
    body: JSON.stringify({ inviteId }),
  }),
  getInviteByToken: (token) => apiRequest(`/api/teams/invites/${token}`),
  acceptInvite: (token) => apiRequest(`/api/teams/invites/${token}`, {
    method: 'POST',
  }),
  leaveTeam: (id) => apiRequest(`/api/teams/${id}/leave`, {
    method: 'POST',
  }),
  transferOwnership: (id, newOwnerId) => apiRequest(`/api/teams/${id}/transfer-ownership`, {
    method: 'POST',
    body: JSON.stringify({ newOwnerId }),
  }),

  // Projects
  getProjects: (teamId) => apiRequest(`/api/projects${teamId ? `?teamId=${teamId}` : ''}`),
  createProject: (data) => apiRequest('/api/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getProject: (id) => apiRequest(`/api/projects/${id}`),
  updateProject: (id, data) => apiRequest(`/api/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteProject: (id) => apiRequest(`/api/projects/${id}`, {
    method: 'DELETE',
  }),

  // Labels
  getLabels: (projectId) => apiRequest(`/api/projects/${projectId}/labels`),
  createLabel: (projectId, data) => apiRequest(`/api/projects/${projectId}/labels`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateLabel: (projectId, labelId, data) => apiRequest(`/api/projects/${projectId}/labels/${labelId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteLabel: (projectId, labelId) => apiRequest(`/api/projects/${projectId}/labels/${labelId}`, {
    method: 'DELETE',
  }),

  // Custom States
  getCustomStates: (projectId) => apiRequest(`/api/projects/${projectId}/states`),
  createCustomState: (projectId, data) => apiRequest(`/api/projects/${projectId}/states`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateCustomState: (projectId, stateId, data) => apiRequest(`/api/projects/${projectId}/states/${stateId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteCustomState: (projectId, stateId) => apiRequest(`/api/projects/${projectId}/states/${stateId}`, {
    method: 'DELETE',
  }),
  reorderCustomStates: (projectId, stateIds) => apiRequest(`/api/projects/${projectId}/states/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ stateIds }),
  }),

  // Issues
  getIssues: (projectId) => apiRequest(`/api/issues${projectId ? `?projectId=${projectId}` : ''}`),
  createIssue: (data) => apiRequest('/api/issues', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getIssue: (id) => apiRequest(`/api/issues/${id}`),
  updateIssue: (id, data) => apiRequest(`/api/issues/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  updateIssueStatus: (id, status) => apiRequest(`/api/issues/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  deleteIssue: (id) => apiRequest(`/api/issues/${id}`, {
    method: 'DELETE',
  }),
  getComments: (issueId) => apiRequest(`/api/issues/${issueId}/comments`),
  addComment: (issueId, content) => apiRequest(`/api/issues/${issueId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  }),

  // AI
  getIssueSummary: (id) => apiRequest(`/api/ai/summary?issueId=${id}`),
  getIssueSuggestions: (id) => apiRequest(`/api/ai/suggestions?issueId=${id}`),
  detectDuplicates: (projectId, title, description) => apiRequest('/api/ai/duplicate-detection', {
    method: 'POST',
    body: JSON.stringify({ projectId, title, description }),
  }),
  autoLabelIssue: (issueId, projectId) => apiRequest('/api/ai/auto-label', {
    method: 'POST',
    body: JSON.stringify({ issueId, projectId }),
  }),

  // Notifications
  getNotifications: () => apiRequest('/api/notifications'),
  markNotificationRead: (id) => apiRequest(`/api/notifications/${id}/read`, {
    method: 'PUT',
  }),

  // Profile
  getProfile: () => apiRequest('/api/profile'),
  updateProfile: (data) => apiRequest('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  updatePassword: (currentPassword, newPassword) => apiRequest('/api/profile/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  }),

  // Dashboard
  getDashboardStats: (type = 'personal') => apiRequest(`/api/dashboard/stats?type=${type}`),

  // Notifications
  getNotifications: (unreadOnly = false) => apiRequest(`/api/notifications?unreadOnly=${unreadOnly}`),
  markNotificationAsRead: (id) => apiRequest(`/api/notifications/${id}/read`, {
    method: 'PUT',
  }),
  markAllNotificationsAsRead: () => apiRequest('/api/notifications/read-all', {
    method: 'PUT',
  }),
};

