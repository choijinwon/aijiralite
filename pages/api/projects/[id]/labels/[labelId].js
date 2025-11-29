// pages/api/projects/[id]/labels/[labelId].js
import { db } from '../../../../../lib/db';
import { authenticate } from '../../../../../lib/auth';
import { checkProjectAccess } from '../../../../../lib/permissions';
import { authOptions } from '../../../../auth/[...nextauth]';
import { z } from 'zod';

const labelUpdateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color').optional()
});

export default async function handler(req, res) {
  try {
    const user = await authenticate(req, authOptions, res);
    const { id: projectId, labelId } = req.query;

    await checkProjectAccess(user.id, projectId);

    const label = await db.label.findUnique({
      where: { id: labelId },
      include: { project: true }
    });

    if (!label) {
      return res.status(404).json({ error: 'Label not found' });
    }

    if (label.projectId !== projectId) {
      return res.status(400).json({ error: 'Label does not belong to this project' });
    }

    if (req.method === 'PUT') {
      const validatedData = labelUpdateSchema.parse(req.body);
      const { name, color } = validatedData;

      // Check if name is being changed and if new name already exists
      if (name && name !== label.name) {
        const existingLabel = await db.label.findUnique({
          where: {
            projectId_name: { projectId, name }
          }
        });

        if (existingLabel) {
          return res.status(400).json({ error: 'Label with this name already exists' });
        }
      }

      const updatedLabel = await db.label.update({
        where: { id: labelId },
        data: {
          ...(name && { name }),
          ...(color && { color })
        }
      });

      res.status(200).json(updatedLabel);
    }
    else if (req.method === 'DELETE') {
      await db.label.delete({
        where: { id: labelId }
      });

      res.status(200).json({ message: 'Label deleted successfully' });
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

