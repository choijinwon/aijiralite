// pages/api/notifications/index.js
import { db } from '../../../lib/db';
import { authenticate } from '../../../lib/auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const startTime = Date.now();
    const user = await authenticate(req, authOptions, res);
    const authTime = Date.now() - startTime;
    
    const { unreadOnly, limit = 50 } = req.query;

    // Build where clause - handle unreadOnly parameter correctly
    const whereClause = {
      userId: user.id,
    };

    // Only filter by isRead if unreadOnly is explicitly 'true'
    if (unreadOnly === 'true') {
      whereClause.isRead = false;
    }
    // If unreadOnly is 'false' or not provided, return all notifications

    const queryStartTime = Date.now();
    // Optimize: Use indexed query with limit first, then order
    const notifications = await db.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: Math.min(parseInt(limit) || 50, 100), // Cap at 100
      select: {
        id: true,
        userId: true,
        type: true,
        title: true,
        message: true,
        isRead: true,
        entityId: true,
        entityType: true,
        createdAt: true,
      },
      // Hint: Ensure userId index is used
    });
    const queryTime = Date.now() - queryStartTime;

    // Only log in development or if slow
    const totalTime = Date.now() - startTime;
    if (process.env.NODE_ENV === 'development' || totalTime > 1000) {
      console.log('Notifications query performance:', {
        authTime: `${authTime}ms`,
        queryTime: `${queryTime}ms`,
        totalTime: `${totalTime}ms`,
        userId: user.id,
        count: notifications.length
      });
    }

    // Set cache headers to prevent 304 caching issues
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Last-Modified', new Date().toUTCString());
    res.setHeader('ETag', `"${Date.now()}"`);

    // Always return an array, even if empty
    res.status(200).json(notifications || []);
  } catch (error) {
    console.error('Get notifications error:', error);
    
    // Handle authentication errors
    if (error.message?.includes('token') || error.message?.includes('No token') || error.message?.includes('Invalid token')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Handle database errors
    if (error.code === 'P2002' || error.code?.startsWith('P')) {
      return res.status(400).json({ error: 'Database error occurred' });
    }
    
    res.status(500).json({ error: error.message || 'Failed to fetch notifications' });
  }
}

