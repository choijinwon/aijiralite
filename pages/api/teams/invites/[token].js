// pages/api/teams/invites/[token].js
import { db } from '../../../../lib/db';
import { authenticate } from '../../../../lib/auth';
import { authOptions } from '../../auth/[...nextauth]';

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

      // Set cache headers to prevent 304 caching issues
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Last-Modified', new Date().toUTCString());
      res.setHeader('ETag', `"${Date.now()}"`);

      res.status(200).json(invite);
    }
    else if (req.method === 'POST') {
      const user = await authenticate(req, authOptions);

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

      // Check if email matches (case-insensitive)
      const userEmail = user.email?.toLowerCase();
      const inviteEmail = invite.email?.toLowerCase();
      
      if (userEmail !== inviteEmail) {
        return res.status(403).json({ 
          error: `This invitation is for ${invite.email}, but you are signed in as ${user.email}` 
        });
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
    console.error('Team invite token API error:', error);
    
    // Handle authentication errors
    if (error.message?.includes('token') || error.message?.includes('No token') || error.message?.includes('Invalid token')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Handle permission errors
    if (error.message?.includes('permission') || error.message?.includes('access') || error.message?.includes('different email')) {
      return res.status(403).json({ error: error.message || 'Access denied' });
    }
    
    // Handle database errors
    if (error.code === 'P2002' || error.code?.startsWith('P')) {
      return res.status(400).json({ error: 'Database constraint violation' });
    }
    
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

