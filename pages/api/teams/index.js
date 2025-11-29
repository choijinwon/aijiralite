// pages/api/teams/index.js
import { db } from '../../../lib/db';
import { authenticate } from '../../../lib/auth';
import { teamSchema } from '../../../lib/validations';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    const user = await authenticate(req, authOptions);

    if (req.method === 'GET') {
      const teams = await db.team.findMany({
        where: {
          deletedAt: null,
          OR: [
            { ownerId: user.id },
            { members: { some: { userId: user.id } } }
          ]
        },
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
          _count: {
            select: { projects: true, members: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json(teams);
    }
    else if (req.method === 'POST') {
      const validatedData = teamSchema.parse(req.body);
      const { name } = validatedData;

      const team = await db.team.create({
        data: {
          name,
          ownerId: user.id,
          members: {
            create: {
              userId: user.id,
              role: 'OWNER'
            }
          }
        },
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

      res.status(201).json(team);
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

