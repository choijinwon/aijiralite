// pages/api/notifications/check-due-dates.js
// This endpoint should be called by a cron job or scheduler
import { checkDueDateNotifications } from '../../../lib/notifications';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Optional: Add authentication/authorization for cron jobs
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'secret'}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const notifications = await checkDueDateNotifications();
    res.status(200).json({ 
      message: 'Due date notifications checked',
      notificationsCreated: notifications.length 
    });
  } catch (error) {
    console.error('Check due dates error:', error);
    res.status(500).json({ error: error.message || 'Failed to check due dates' });
  }
}

