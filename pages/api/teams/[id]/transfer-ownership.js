// pages/api/teams/[id]/transfer-ownership.js
import { db } from '../../../../lib/db';
import { authenticate } from '../../../../lib/auth';
import { checkTeamRole } from '../../../../lib/permissions';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await authenticate(req);
    const { id } = req.query;

    await checkTeamRole(user.id, id, ['OWNER']);

    const { newOwnerId } = req.body;

    if (!newOwnerId) {
      return res.status(400).json({ error: 'New owner ID is required' });
    }

    // Check if new owner is a team member
    const newOwnerMember = await db.teamMember.findUnique({
      where: {
        teamId_userId: { teamId: id, userId: newOwnerId }
      }
    });

    if (!newOwnerMember) {
      return res.status(400).json({ error: 'New owner must be a team member' });
    }

    await db.$transaction(async (tx) => {
      // Update team owner
      await tx.team.update({
        where: { id },
        data: { ownerId: newOwnerId }
      });

      // Update old owner's role to ADMIN
      await tx.teamMember.update({
        where: {
          teamId_userId: { teamId: id, userId: user.id }
        },
        data: { role: 'ADMIN' }
      });

      // Update new owner's role to OWNER
      await tx.teamMember.update({
        where: {
          teamId_userId: { teamId: id, userId: newOwnerId }
        },
        data: { role: 'OWNER' }
      });

      // Create activity
      await tx.teamActivity.create({
        data: {
          teamId: id,
          userId: user.id,
          type: 'ownership_transferred',
          details: JSON.stringify({ 
            fromUserId: user.id,
            toUserId: newOwnerId
          })
        }
      });
    });

    res.status(200).json({ message: 'Ownership transferred successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

