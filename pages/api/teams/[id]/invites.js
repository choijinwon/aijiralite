// pages/api/teams/[id]/invites.js
import { db } from '../../../../lib/db';
import { authenticate } from '../../../../lib/auth';
import { checkTeamRole } from '../../../../lib/permissions';
import { sendTeamInvite } from '../../../../lib/email';
import { notifyTeamInvited } from '../../../../lib/notifications';
import crypto from 'crypto';

export default async function handler(req, res) {
  try {
    const user = await authenticate(req);
    const { id } = req.query;

    if (req.method === 'GET') {
      await checkTeamRole(user.id, id, ['OWNER', 'ADMIN']);

      const invites = await db.teamInvite.findMany({
        where: {
          teamId: id,
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json(invites);
    }
    else if (req.method === 'POST') {
      await checkTeamRole(user.id, id, ['OWNER', 'ADMIN']);

      const { email, role } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Check if user is already a member
      const existingUser = await db.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        const existingMember = await db.teamMember.findUnique({
          where: {
            teamId_userId: { teamId: id, userId: existingUser.id }
          }
        });

        if (existingMember) {
          return res.status(400).json({ error: 'User is already a team member' });
        }
      }

      // Check for existing pending invite
      const existingInvite = await db.teamInvite.findFirst({
        where: {
          teamId: id,
          email,
          expiresAt: { gt: new Date() }
        }
      });

      if (existingInvite) {
        return res.status(400).json({ error: 'Invitation already sent to this email' });
      }

      // Generate invite token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      const invite = await db.teamInvite.create({
        data: {
          email,
          teamId: id,
          role: role || 'MEMBER',
          token,
          expiresAt
        }
      });

      // Send invitation email
      const team = await db.team.findUnique({
        where: { id }
      });

      const inviteLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/teams/invite/${token}`;
      await sendTeamInvite(email, team.name, inviteLink);

      // Create notification if user exists
      if (existingUser) {
        await notifyTeamInvited(existingUser.id, team.name, user.name, inviteLink);
      }

      res.status(201).json(invite);
    }
    else if (req.method === 'DELETE') {
      await checkTeamRole(user.id, id, ['OWNER', 'ADMIN']);

      const { inviteId } = req.body;

      await db.teamInvite.delete({
        where: { id: inviteId }
      });

      res.status(200).json({ message: 'Invitation cancelled successfully' });
    }
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

