// pages/api/projects/[id]/issues.js
import { db } from '../../../../lib/db';
import { authenticate } from '../../../../lib/auth';
import { checkProjectAccess } from '../../../../lib/permissions';

export default async function handler(req, res) {
  try {
    const user = await authenticate(req);
    const { id } = req.query;

    await checkProjectAccess(user.id, id);

    if (req.method === 'GET') {
      const issues = await db.issue.findMany({
        where: {
          projectId: id,
          deletedAt: null
        },
        include: {
          creator: {
            select: { id: true, name: true, avatar: true }
          },
          assignee: {
            select: { id: true, name: true, avatar: true }
          },
          labelIssues: {
            include: {
              label: true
            }
          },
          _count: {
            select: { comments: true, subtasks: true }
          }
        },
        orderBy: [
          { position: 'asc' },
          { createdAt: 'desc' }
        ]
      });

      res.status(200).json(issues);
    }
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

