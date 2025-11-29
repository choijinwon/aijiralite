// pages/api/ai/duplicate-detection.js
import { db } from '../../../lib/db';
import { authenticate } from '../../../lib/auth';
import { checkProjectAccess } from '../../../lib/permissions';
import { detectDuplicateIssues } from '../../../lib/ai';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await authenticate(req, authOptions, res);
    const { projectId, title, description } = req.body;

    if (!projectId || !title) {
      return res.status(400).json({ error: 'Project ID and title are required' });
    }

    await checkProjectAccess(user.id, projectId);

    const duplicates = await detectDuplicateIssues(projectId, title, description || '');

    res.status(200).json({ duplicates });
  } catch (error) {
    console.error('Duplicate detection error:', error);
    res.status(500).json({ error: error.message || 'Failed to detect duplicates' });
  }
}

