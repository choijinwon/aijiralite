// pages/api/projects/[id]/labels.js
import { db } from '../../../../lib/db';
import { authenticate } from '../../../../lib/auth';
import { checkProjectAccess } from '../../../../lib/permissions';
import { z } from 'zod';

const labelSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
});

export default async function handler(req, res) {
  try {
    const user = await authenticate(req);
    const { id: projectId } = req.query;

    await checkProjectAccess(user.id, projectId);

    if (req.method === 'GET') {
      const labels = await db.label.findMany({
        where: { projectId },
        include: {
          _count: {
            select: { labelIssues: true }
          }
        },
        orderBy: { name: 'asc' }
      });

      // Set cache headers to prevent 304 caching issues
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Last-Modified', new Date().toUTCString());
      res.setHeader('ETag', `"${Date.now()}"`);

      res.status(200).json(labels);
    }
    else if (req.method === 'POST') {
      const validatedData = labelSchema.parse(req.body);
      const { name, color } = validatedData;

      // Check if label with same name already exists
      const existingLabel = await db.label.findUnique({
        where: {
          projectId_name: { projectId, name }
        }
      });

      if (existingLabel) {
        return res.status(400).json({ error: 'Label with this name already exists' });
      }

      const label = await db.label.create({
        data: {
          name,
          color: color || '#3B82F6',
          projectId
        }
      });

      res.status(201).json(label);
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

