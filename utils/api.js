// utils/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function apiRequest(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
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
  getTeamInvites: (id) => apiRequest(`/api/teams/${id}/invites`),
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

