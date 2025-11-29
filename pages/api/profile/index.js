// pages/api/profile/index.js
import { db } from '../../../lib/db';
import { authenticate } from '../../../lib/auth';

export default async function handler(req, res) {
  try {
    const user = await authenticate(req);

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

      res.status(200).json(userData);
    }
    else if (req.method === 'PUT') {
      const { name, avatar } = req.body;

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
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

