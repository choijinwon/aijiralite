// pages/api/projects/index.js
import { db } from '../../../lib/db';
import { authenticate } from '../../../lib/auth';
import { checkTeamMembership } from '../../../lib/permissions';
import { projectSchema } from '../../../lib/validations';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    const user = await authenticate(req, authOptions, res);
    const { teamId } = req.query;

    if (req.method === 'GET') {
      // Build where clause to include:
      // 1. Projects owned by user
      // 2. Projects in teams where user is a member (including team owner)
      const where = {
        deletedAt: null,
        OR: [
          { ownerId: user.id },
          { 
            team: { 
              OR: [
                { ownerId: user.id },
                { members: { some: { userId: user.id } } }
              ]
            }
          }
        ]
      };

      if (teamId) {
        // Verify user has access to this team
        try {
          await checkTeamMembership(user.id, teamId);
        } catch (error) {
          // If not a member, still allow if they're the team owner
          const team = await db.team.findUnique({
            where: { id: teamId, deletedAt: null }
          });
          if (!team || team.ownerId !== user.id) {
            throw error;
          }
        }
        where.teamId = teamId;
      }

      const projects = await db.project.findMany({
        where,
        include: {
          team: {
            select: { id: true, name: true }
          },
          owner: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          _count: {
            select: { issues: true, labels: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Set cache headers to prevent 304 caching issues
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Last-Modified', new Date().toUTCString());
      res.setHeader('ETag', `"${Date.now()}"`);

      res.status(200).json(projects);
    }
    else if (req.method === 'POST') {
      const validatedData = projectSchema.parse(req.body);
      const { name, description, teamId: projectTeamId } = validatedData;

      await checkTeamMembership(user.id, projectTeamId);

      const project = await db.project.create({
        data: {
          name,
          description,
          teamId: projectTeamId,
          ownerId: user.id
        },
        include: {
          team: {
            select: { id: true, name: true }
          },
          owner: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      });

      res.status(201).json(project);
    }
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Projects API error:', error);
    
    // Handle authentication errors
    if (error.message?.includes('token') || error.message?.includes('No token') || error.message?.includes('Invalid token')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    
    // Handle permission errors
    if (error.message?.includes('permission') || error.message?.includes('access')) {
      return res.status(403).json({ error: error.message || 'Access denied' });
    }
    
    // Handle database errors
    if (error.code === 'P2002' || error.code?.startsWith('P')) {
      return res.status(400).json({ error: 'Database constraint violation' });
    }
    
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

