// pages/api/projects/[id].js
import { db } from '../../../lib/db';
import { authenticate } from '../../../lib/auth';
import { checkProjectAccess } from '../../../lib/permissions';
import { projectSchema } from '../../../lib/validations';

export default async function handler(req, res) {
  try {
    const user = await authenticate(req);
    const { id } = req.query;

    if (req.method === 'GET') {
      await checkProjectAccess(user.id, id);

      const project = await db.project.findUnique({
        where: { id, deletedAt: null },
        select: {
          id: true,
          name: true,
          description: true,
          teamId: true,
          ownerId: true,
          isArchived: true,
          createdAt: true,
          updatedAt: true,
          team: {
            select: { 
              id: true, 
              name: true,
              _count: {
                select: { members: true }
              }
            }
          },
          owner: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          labels: true,
          customStates: {
            orderBy: { position: 'asc' }
          },
          _count: {
            select: { 
              issues: true,
              labels: true,
              customStates: true
            }
          }
        }
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.status(200).json(project);
    }
    else if (req.method === 'PUT') {
      await checkProjectAccess(user.id, id);

      const validatedData = projectSchema.partial().parse(req.body);
      const { name, description, isArchived } = validatedData;

      const project = await db.project.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(isArchived !== undefined && { isArchived })
        },
        select: {
          id: true,
          name: true,
          description: true,
          teamId: true,
          ownerId: true,
          isArchived: true,
          createdAt: true,
          updatedAt: true,
          team: {
            select: { id: true, name: true }
          },
          owner: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          labels: true,
          customStates: {
            orderBy: { position: 'asc' }
          },
          _count: {
            select: { 
              issues: true,
              labels: true,
              customStates: true
            }
          }
        }
      });

      res.status(200).json(project);
    }
    else if (req.method === 'DELETE') {
      const project = await checkProjectAccess(user.id, id);

      // Check if user has permission to delete
      const canDelete = project.ownerId === user.id || 
        await db.teamMember.findFirst({
          where: { 
            userId: user.id, 
            teamId: project.teamId,
            role: { in: ['OWNER', 'ADMIN'] }
          }
        });

      if (!canDelete) {
        return res.status(403).json({ error: 'Permission denied' });
      }

      await db.project.update({
        where: { id },
        data: { deletedAt: new Date() }
      });

      res.status(200).json({ message: 'Project deleted successfully' });
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

