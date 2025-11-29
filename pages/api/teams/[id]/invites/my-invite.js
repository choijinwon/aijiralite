// pages/api/teams/[id]/invites/my-invite.js
import { db } from '../../../../../lib/db';
import { authenticate } from '../../../../../lib/auth';
import { authOptions } from '../../../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await authenticate(req, authOptions, res);
    const { id: teamId } = req.query;

    // Find pending invite for current user's email
    const invite = await db.teamInvite.findFirst({
      where: {
        teamId: teamId,
        email: user.email.toLowerCase(),
        expiresAt: { gt: new Date() }
      },
      include: {
        team: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!invite) {
      return res.status(404).json({ error: 'No pending invitation found' });
    }

    // Generate invite link
    const inviteLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/teams/invite/${invite.token}`;

    // Set cache headers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.status(200).json({
      id: invite.id,
      email: invite.email,
      teamId: invite.teamId,
      role: invite.role,
      token: invite.token,
      inviteLink,
      expiresAt: invite.expiresAt,
      createdAt: invite.createdAt,
      team: invite.team
    });
  } catch (error) {
    console.error('Get my invite API error:', error);
    
    if (error.message?.includes('token') || error.message?.includes('No token') || error.message?.includes('Invalid token')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

