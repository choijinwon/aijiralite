// pages/api/teams/[id]/members.js
import { db } from '../../../../lib/db';
import { authenticate } from '../../../../lib/auth';
import { checkTeamRole } from '../../../../lib/permissions';

export default async function handler(req, res) {
  try {
    const user = await authenticate(req);
    const { id } = req.query;

    if (req.method === 'GET') {
      const members = await db.teamMember.findMany({
        where: { teamId: id },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        },
        orderBy: { joinedAt: 'asc' }
      });

      res.status(200).json(members);
    }
    else if (req.method === 'POST') {
      await checkTeamRole(user.id, id, ['OWNER', 'ADMIN']);

      const { userId, role } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Check if already a member
      const existingMember = await db.teamMember.findUnique({
        where: {
          teamId_userId: { teamId: id, userId }
        }
      });

      if (existingMember) {
        return res.status(400).json({ error: 'User is already a team member' });
      }

      const member = await db.$transaction(async (tx) => {
        const newMember = await tx.teamMember.create({
          data: {
            teamId: id,
            userId,
            role: role || 'MEMBER'
          },
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          }
        });

        // Create activity
        await tx.teamActivity.create({
          data: {
            teamId: id,
            userId: user.id,
            type: 'member_added',
            details: JSON.stringify({ 
              addedUserId: userId, 
              role: role || 'MEMBER',
              addedBy: user.id
            })
          }
        });

        return newMember;
      });

      res.status(201).json(member);
    }
    else if (req.method === 'DELETE') {
      await checkTeamRole(user.id, id, ['OWNER', 'ADMIN']);

      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Check if trying to remove owner
      const team = await db.team.findUnique({
        where: { id }
      });

      if (team.ownerId === userId) {
        return res.status(400).json({ error: 'Cannot remove team owner' });
      }

      if (userId === user.id) {
        return res.status(400).json({ error: 'Cannot remove yourself. Please leave the team instead.' });
      }

      await db.$transaction(async (tx) => {
        await tx.teamMember.delete({
          where: {
            teamId_userId: { teamId: id, userId }
          }
        });

        // Create activity
        await tx.teamActivity.create({
          data: {
            teamId: id,
            userId: user.id,
            type: 'member_removed',
            details: JSON.stringify({ 
              removedUserId: userId,
              removedBy: user.id
            })
          }
        });
      });

      res.status(200).json({ message: 'Member removed successfully' });
    }
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

