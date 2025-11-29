// pages/api/projects/[id]/states/[stateId].js
import { db } from '../../../../../lib/db';
import { authenticate } from '../../../../../lib/auth';
import { checkProjectAccess } from '../../../../../lib/permissions';
import { z } from 'zod';

const stateUpdateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color').optional(),
  position: z.number().int().optional(),
  wipLimit: z.number().int().positive().nullable().optional()
});

export default async function handler(req, res) {
  try {
    const user = await authenticate(req);
    const { id: projectId, stateId } = req.query;

    await checkProjectAccess(user.id, projectId);

    const state = await db.customState.findUnique({
      where: { id: stateId },
      include: { project: true }
    });

    if (!state) {
      return res.status(404).json({ error: 'State not found' });
    }

    if (state.projectId !== projectId) {
      return res.status(400).json({ error: 'State does not belong to this project' });
    }

    if (req.method === 'PUT') {
      const validatedData = stateUpdateSchema.parse(req.body);
      const { name, color, position, wipLimit } = validatedData;

      // Check if name is being changed and if new name already exists
      if (name && name !== state.name) {
        const existingState = await db.customState.findUnique({
          where: {
            projectId_name: { projectId, name }
          }
        });

        if (existingState) {
          return res.status(400).json({ error: 'State with this name already exists' });
        }

        // Update all issues with old status to new status
        await db.issue.updateMany({
          where: {
            projectId,
            status: state.name,
            deletedAt: null
          },
          data: {
            status: name
          }
        });
      }

      const updatedState = await db.customState.update({
        where: { id: stateId },
        data: {
          ...(name && { name }),
          ...(color && { color }),
          ...(position !== undefined && { position }),
          ...(wipLimit !== undefined && { wipLimit })
        }
      });

      res.status(200).json(updatedState);
    }
    else if (req.method === 'DELETE') {
      // Check if there are issues using this state
      const issueCount = await db.issue.count({
        where: {
          projectId,
          status: state.name,
          deletedAt: null
        }
      });

      if (issueCount > 0) {
        return res.status(400).json({ 
          error: `Cannot delete state. ${issueCount} issue(s) are using this state. Please move them to another state first.` 
        });
      }

      await db.customState.delete({
        where: { id: stateId }
      });

      res.status(200).json({ message: 'State deleted successfully' });
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

