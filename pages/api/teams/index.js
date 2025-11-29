// pages/api/teams/index.js
import { db } from '../../../lib/db';
import { authenticate } from '../../../lib/auth';
import { teamSchema } from '../../../lib/validations';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    const user = await authenticate(req, authOptions);

    if (req.method === 'GET') {
      const teams = await db.team.findMany({
        where: {
          deletedAt: null,
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } }
          ]
        },
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
          _count: {
            select: { projects: true, members: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Sort members by joinedAt after fetching
      const teamsWithSortedMembers = teams.map(team => ({
        ...team,
        members: team.members.sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt))
      }));

      // Set cache headers to prevent 304 caching issues
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Last-Modified', new Date().toUTCString());
      res.setHeader('ETag', `"${Date.now()}"`);
      
      res.status(200).json(teamsWithSortedMembers);
    }
    else if (req.method === 'POST') {
      const validatedData = teamSchema.parse(req.body);
      const { name } = validatedData;

      const team = await db.team.create({
        data: {
          name,
          ownerId: user.id,
          members: {
            create: {
              userId: user.id,
              role: 'OWNER'
            }
          }
        },
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

      res.status(201).json(team);
    }
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Teams API error:', error);
    
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

