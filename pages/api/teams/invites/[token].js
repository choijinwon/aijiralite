// pages/api/teams/invites/[token].js
import { db } from '../../../../lib/db';
import { authenticate } from '../../../../lib/auth';

export default async function handler(req, res) {
  try {
    const { token } = req.query;

    if (req.method === 'GET') {
      const invite = await db.teamInvite.findUnique({
        where: { token },
        include: {
          team: {
            select: {
              id: true,
              name: true,
              owner: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });

      if (!invite) {
        return res.status(404).json({ error: 'Invitation not found' });
      }

      if (new Date() > invite.expiresAt) {
        return res.status(400).json({ error: 'Invitation has expired' });
      }

      res.status(200).json(invite);
    }
    else if (req.method === 'POST') {
      const user = await authenticate(req);

      const invite = await db.teamInvite.findUnique({
        where: { token },
        include: {
          team: true
        }
      });

      if (!invite) {
        return res.status(404).json({ error: 'Invitation not found' });
      }

      if (new Date() > invite.expiresAt) {
        return res.status(400).json({ error: 'Invitation has expired' });
      }

      // Check if email matches
      if (invite.email !== user.email) {
        return res.status(403).json({ error: 'This invitation is for a different email address' });
      }

      // Check if already a member
      const existingMember = await db.teamMember.findUnique({
        where: {
          teamId_userId: { teamId: invite.teamId, userId: user.id }
        }
      });

      if (existingMember) {
        // Delete invite and return success
        await db.teamInvite.delete({ where: { id: invite.id } });
        return res.status(200).json({ message: 'Already a team member', team: invite.team });
      }

      // Add user to team
      await db.$transaction(async (tx) => {
        await tx.teamMember.create({
          data: {
            teamId: invite.teamId,
            userId: user.id,
            role: invite.role
          }
        });

        await tx.teamInvite.delete({
          where: { id: invite.id }
        });

        // Create activity
        await tx.teamActivity.create({
          data: {
            teamId: invite.teamId,
            userId: user.id,
            type: 'member_join',
            details: JSON.stringify({ email: user.email, role: invite.role })
          }
        });
      });

      res.status(200).json({ message: 'Successfully joined team', team: invite.team });
    }
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

