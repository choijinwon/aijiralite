// lib/permissions.js
import { db } from './db';

export async function checkTeamMembership(userId, teamId) {
  try {
    // Check if user is owner
    const team = await db.team.findUnique({
      where: { id: teamId, deletedAt: null }
    });

    if (!team) {
      throw new Error('Team not found');
    }

    if (team.ownerId === userId) {
      return { role: 'OWNER', userId, teamId };
    }

    // Check if user is a member
    const membership = await db.teamMember.findUnique({
      where: {
        teamId_userId: { teamId, userId }
      }
    });

    if (!membership) {
      throw new Error('Access denied: Not a team member');
    }

    return membership;
  } catch (error) {
    // Re-throw with more context if it's a database error
    if (error.message?.includes('DATABASE_URL') || error.message?.includes('Environment variable')) {
      throw new Error('Database configuration error: DATABASE_URL is not set');
    }
    // Re-throw permission/access errors as-is
    if (error.message?.includes('Access denied') || error.message?.includes('not found')) {
      throw error;
    }
    // Wrap other database errors
    console.error('checkTeamMembership error:', error);
    throw new Error(`Failed to check team membership: ${error.message}`);
  }
}

export async function checkTeamRole(userId, teamId, requiredRoles) {
  const membership = await checkTeamMembership(userId, teamId);
  
  // Handle both object format and direct role string
  const userRole = typeof membership === 'string' ? membership : membership.role;
  
  if (!requiredRoles.includes(userRole)) {
    throw new Error(`Access denied: Required role ${requiredRoles.join(' or ')}`);
  }

  return membership;
}

export async function checkProjectAccess(userId, projectId) {
  try {
    const project = await db.project.findUnique({
      where: { id: projectId, deletedAt: null },
      include: { team: true }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    await checkTeamMembership(userId, project.teamId);
    return project;
  } catch (error) {
    // Re-throw with more context if it's a database error
    if (error.message?.includes('DATABASE_URL') || error.message?.includes('Environment variable')) {
      throw new Error('Database configuration error: DATABASE_URL is not set');
    }
    // Re-throw permission/access errors as-is
    if (error.message?.includes('Access denied') || error.message?.includes('not found')) {
      throw error;
    }
    // Wrap other database errors
    console.error('checkProjectAccess error:', error);
    throw new Error(`Failed to check project access: ${error.message}`);
  }
}

export function hasTeamPermission(membership, requiredRoles) {
  if (!membership) return false;
  return requiredRoles.includes(membership.role);
}

