// pages/api/notifications/index.js
import { db } from '../../../lib/db';
import { authenticate } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await authenticate(req);
    const { unreadOnly, limit = 50 } = req.query;

    const notifications = await db.notification.findMany({
      where: {
        userId: user.id,
        ...(unreadOnly === 'true' && { isRead: false })
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch notifications' });
  }
}

