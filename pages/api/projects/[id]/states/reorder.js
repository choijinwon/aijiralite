// pages/api/projects/[id]/states/reorder.js
import { db } from '../../../../../lib/db';
import { authenticate } from '../../../../../lib/auth';
import { checkProjectAccess } from '../../../../../lib/permissions';
import { z } from 'zod';

const reorderSchema = z.object({
  stateIds: z.array(z.string()).min(1)
});

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await authenticate(req);
    const { id: projectId } = req.query;

    await checkProjectAccess(user.id, projectId);

    const validatedData = reorderSchema.parse(req.body);
    const { stateIds } = validatedData;

    // Verify all states belong to this project
    const states = await db.customState.findMany({
      where: {
        id: { in: stateIds },
        projectId
      }
    });

    if (states.length !== stateIds.length) {
      return res.status(400).json({ error: 'Some states do not belong to this project' });
    }

    // Update positions
    await db.$transaction(
      stateIds.map((stateId, index) =>
        db.customState.update({
          where: { id: stateId },
          data: { position: index }
        })
      )
    );

    const updatedStates = await db.customState.findMany({
      where: { projectId },
      orderBy: { position: 'asc' }
    });

    res.status(200).json(updatedStates);
  } catch (error) {
    console.error(error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

