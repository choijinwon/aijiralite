// pages/api/teams/[id]/leave.js
import { db } from '../../../../lib/db';
import { authenticate } from '../../../../lib/auth';
import { checkTeamMembership } from '../../../../lib/permissions';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await authenticate(req, authOptions, res);
    const { id } = req.query;

    await checkTeamMembership(user.id, id);

    // Check if user is owner
    const team = await db.team.findUnique({
      where: { id }
    });

    if (team.ownerId === user.id) {
      return res.status(400).json({ error: 'Team owner cannot leave. Transfer ownership or delete the team instead.' });
    }

    await db.$transaction(async (tx) => {
      await tx.teamMember.delete({
        where: {
          teamId_userId: { teamId: id, userId: user.id }
        }
      });

      // Create activity
      await tx.teamActivity.create({
        data: {
          teamId: id,
          userId: user.id,
          type: 'member_left',
          details: JSON.stringify({ email: user.email })
        }
      });
    });

    res.status(200).json({ message: 'Successfully left the team' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

