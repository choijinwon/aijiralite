// pages/api/projects/[id]/states.js
import { db } from '../../../../lib/db';
import { authenticate } from '../../../../lib/auth';
import { checkProjectAccess } from '../../../../lib/permissions';
import { z } from 'zod';

const customStateSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color').optional(),
  position: z.number().int().optional(),
  wipLimit: z.number().int().positive().nullable().optional()
});

export default async function handler(req, res) {
  try {
    const user = await authenticate(req);
    const { id: projectId } = req.query;

    await checkProjectAccess(user.id, projectId);

    if (req.method === 'GET') {
      const states = await db.customState.findMany({
        where: { projectId },
        orderBy: { position: 'asc' }
      });

      // Get issue counts for each state
      const statesWithCounts = await Promise.all(
        states.map(async (state) => {
          const issueCount = await db.issue.count({
            where: {
              projectId,
              status: state.name,
              deletedAt: null
            }
          });

          return {
            ...state,
            issueCount
          };
        })
      );

      res.status(200).json(statesWithCounts);
    }
    else if (req.method === 'POST') {
      const validatedData = customStateSchema.parse(req.body);
      const { name, color, position, wipLimit } = validatedData;

      // Check if state with same name already exists
      const existingState = await db.customState.findUnique({
        where: {
          projectId_name: { projectId, name }
        }
      });

      if (existingState) {
        return res.status(400).json({ error: 'State with this name already exists' });
      }

      // Get max position if not provided
      let finalPosition = position;
      if (finalPosition === undefined) {
        const maxState = await db.customState.findFirst({
          where: { projectId },
          orderBy: { position: 'desc' }
        });
        finalPosition = maxState ? maxState.position + 1 : 0;
      }

      const state = await db.customState.create({
        data: {
          name,
          color: color || '#6B7280',
          position: finalPosition,
          projectId,
          wipLimit: wipLimit !== undefined ? wipLimit : null
        }
      });

      res.status(201).json(state);
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

