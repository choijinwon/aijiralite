// pages/api/notifications/[id]/read.js
import { db } from '../../../../lib/db';
import { authenticate } from '../../../../lib/auth';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await authenticate(req, authOptions, res);
    const { id } = req.query;

    const notification = await db.notification.update({
      where: {
        id,
        userId: user.id
      },
      data: {
        isRead: true
      }
    });

    res.status(200).json(notification);
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: error.message || 'Failed to mark notification as read' });
  }
}

