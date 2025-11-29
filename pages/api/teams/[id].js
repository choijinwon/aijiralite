// pages/api/teams/[id].js
import { db } from '../../../lib/db';
import { authenticate } from '../../../lib/auth';
import { checkTeamMembership, checkTeamRole } from '../../../lib/permissions';
import { teamSchema } from '../../../lib/validations';

export default async function handler(req, res) {
  try {
    const user = await authenticate(req);
    const { id } = req.query;

    if (req.method === 'GET') {
      await checkTeamMembership(user.id, id);

      const team = await db.team.findUnique({
        where: { id, deletedAt: null },
        include: {
          owner: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatar: true }
              }
            }
          },
          projects: {
            where: { deletedAt: null },
            include: {
              _count: {
                select: { issues: true }
              }
            }
          },
          _count: {
            select: { members: true, projects: true }
          }
        }
      });

      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }

      res.status(200).json(team);
    }
    else if (req.method === 'PUT') {
      await checkTeamRole(user.id, id, ['OWNER', 'ADMIN']);

      const validatedData = teamSchema.parse(req.body);
      const { name } = validatedData;

      const team = await db.team.update({
        where: { id },
        data: { name },
        include: {
          owner: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatar: true }
              }
            }
          }
        }
      });

      res.status(200).json(team);
    }
    else if (req.method === 'DELETE') {
      await checkTeamRole(user.id, id, ['OWNER']);

      await db.team.update({
        where: { id },
        data: { deletedAt: new Date() }
      });

      res.status(200).json({ message: 'Team deleted successfully' });
    }
    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

