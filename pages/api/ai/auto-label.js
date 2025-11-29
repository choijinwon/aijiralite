// pages/api/ai/auto-label.js
import { db } from '../../../lib/db';
import { authenticate } from '../../../lib/auth';
import { checkProjectAccess } from '../../../lib/permissions';
import { autoLabelIssue } from '../../../lib/ai';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await authenticate(req, authOptions);
    const { issueId, projectId } = req.body;

    if (!issueId || !projectId) {
      return res.status(400).json({ error: 'Issue ID and Project ID are required' });
    }

    await checkProjectAccess(user.id, projectId);

    const labels = await autoLabelIssue(issueId, projectId, user.id);

    res.status(200).json({ labels });
  } catch (error) {
    console.error('Auto-label error:', error);
    res.status(500).json({ error: error.message || 'Failed to auto-label issue' });
  }
}

