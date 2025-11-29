// pages/api/profile/index.js
import { db } from '../../../lib/db';
import { authenticate } from '../../../lib/auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    const user = await authenticate(req, authOptions, res);

    if (req.method === 'GET') {
      const userData = await db.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          provider: true,
          createdAt: true,
        }
      });

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(userData);
    }
    else if (req.method === 'PUT') {
      const { name, avatar } = req.body;

      // Validate input
      if (!name && avatar === undefined) {
        return res.status(400).json({ error: 'At least one field (name or avatar) is required' });
      }

      const updatedUser = await db.user.update({
        where: { id: user.id },
        data: {
          ...(name && { name }),
          ...(avatar !== undefined && { avatar }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          provider: true,
          createdAt: true,
        }
      });

      res.status(200).json(updatedUser);
    }
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Profile error:', error);
    
    // Handle authentication errors
    if (error.message?.includes('token') || 
        error.message?.includes('No token') || 
        error.message?.includes('Invalid token')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Handle database errors
    if (error.code === 'P2002' || error.code?.startsWith('P')) {
      return res.status(400).json({ error: 'Database error occurred' });
    }
    
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

