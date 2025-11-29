// pages/api/teams/[id]/members/[userId]/role.js
import { db } from '../../../../../../lib/db';
import { authenticate } from '../../../../../../lib/auth';
import { checkTeamRole } from '../../../../../../lib/permissions';
import { notifyRoleChanged } from '../../../../../../lib/notifications';
import { authOptions } from '../../../../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    const user = await authenticate(req, authOptions, res);
    const { id, userId } = req.query;

    if (req.method === 'PUT') {
      await checkTeamRole(user.id, id, ['OWNER', 'ADMIN']);

      const { role } = req.body;

      if (!['OWNER', 'ADMIN', 'MEMBER'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      // Check if trying to change owner's role
      const team = await db.team.findUnique({
        where: { id }
      });

      if (team.ownerId === userId && role !== 'OWNER') {
        return res.status(400).json({ error: 'Cannot change owner role' });
      }

      // Check if user is trying to change their own role to lower
      if (userId === user.id) {
        const currentMember = await db.teamMember.findUnique({
          where: {
            teamId_userId: { teamId: id, userId: user.id }
          }
        });

        if (currentMember.role === 'OWNER' && role !== 'OWNER') {
          return res.status(400).json({ error: 'Owner cannot change their own role' });
        }
      }

      const updated = await db.teamMember.update({
        where: {
          teamId_userId: { teamId: id, userId }
        },
        data: { role },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      });

      // Create activity
      await db.teamActivity.create({
        data: {
          teamId: id,
          userId: user.id,
          type: 'role_changed',
          details: JSON.stringify({ 
            targetUserId: userId, 
            newRole: role,
            changedBy: user.id
          })
        }
      });

      // Create notification for the user whose role was changed
      const targetUser = await db.user.findUnique({ where: { id: userId } });
      if (targetUser && targetUser.id !== user.id) { // Don't notify if user changes their own role
        await notifyRoleChanged(userId, team.name, role, user.name);
      }

      res.status(200).json(updated);
    }
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

