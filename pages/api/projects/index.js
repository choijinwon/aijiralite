// pages/api/projects/index.js
import { db } from '../../../lib/db';
import { authenticate } from '../../../lib/auth';
import { checkTeamMembership } from '../../../lib/permissions';
import { projectSchema } from '../../../lib/validations';

export default async function handler(req, res) {
  try {
    const user = await authenticate(req);
    const { teamId } = req.query;

    if (req.method === 'GET') {
      const where = {
        deletedAt: null,
        OR: [
          { ownerId: user.id },
          { team: { members: { some: { userId: user.id } } } }
        ]
      };

      if (teamId) {
        await checkTeamMembership(user.id, teamId);
        where.teamId = teamId;
      }

      const projects = await db.project.findMany({
        where,
        include: {
          team: {
            select: { id: true, name: true }
          },
          owner: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          _count: {
            select: { issues: true, labels: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json(projects);
    }
    else if (req.method === 'POST') {
      const validatedData = projectSchema.parse(req.body);
      const { name, description, teamId: projectTeamId } = validatedData;

      await checkTeamMembership(user.id, projectTeamId);

      const project = await db.project.create({
        data: {
          name,
          description,
          teamId: projectTeamId,
          ownerId: user.id
        },
        include: {
          team: {
            select: { id: true, name: true }
          },
          owner: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      });

      res.status(201).json(project);
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

