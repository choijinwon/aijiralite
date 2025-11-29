// pages/api/teams/[id].js
import { db } from '../../../lib/db';
import { authenticate } from '../../../lib/auth';
import { checkTeamMembership, checkTeamRole } from '../../../lib/permissions';
import { teamSchema } from '../../../lib/validations';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    const user = await authenticate(req, authOptions, res);
    const { id } = req.query;

    if (req.method === 'GET') {
      await checkTeamMembership(user.id, id);

      const team = await db.team.findUnique({
        where: { id, deletedAt: null },
        include: {
          owner: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatar: true }
              }
            }
          },
          projects: {
            where: { deletedAt: null },
            include: {
              _count: {
                select: { issues: true }
              }
            }
          },
          _count: {
            select: { members: true, projects: true }
          }
        }
      });

      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }

      // Set cache headers to prevent 304 caching issues
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Last-Modified', new Date().toUTCString());
      res.setHeader('ETag', `"${Date.now()}"`);

      res.status(200).json(team);
    }
    else if (req.method === 'PUT') {
      await checkTeamRole(user.id, id, ['OWNER', 'ADMIN']);

      const validatedData = teamSchema.parse(req.body);
      const { name } = validatedData;

      const team = await db.team.update({
        where: { id },
        data: { name },
        include: {
          owner: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatar: true }
              }
            }
          }
        }
      });

      res.status(200).json(team);
    }
    else if (req.method === 'DELETE') {
      await checkTeamRole(user.id, id, ['OWNER']);

      await db.team.update({
        where: { id },
        data: { deletedAt: new Date() }
      });

      res.status(200).json({ message: 'Team deleted successfully' });
    }
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Team API error:', error);
    
    // Handle authentication errors
    if (error.message?.includes('token') || error.message?.includes('No token') || error.message?.includes('Invalid token')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    
    // Handle permission errors
    if (error.message?.includes('permission') || error.message?.includes('access') || error.message?.includes('not found')) {
      return res.status(403).json({ error: error.message || 'Access denied' });
    }
    
    // Handle database errors
    if (error.code === 'P2002' || error.code?.startsWith('P')) {
      return res.status(400).json({ error: 'Database constraint violation' });
    }
    
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

