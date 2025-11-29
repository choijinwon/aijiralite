// pages/api/ai/summary.js
import { db } from '../../../lib/db';
import { authenticate } from '../../../lib/auth';
import { checkProjectAccess } from '../../../lib/permissions';
import { generateIssueSummary, getRemainingRequests } from '../../../lib/ai';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await authenticate(req, authOptions, res);
    const { issueId } = req.query;

    if (!issueId) {
      return res.status(400).json({ error: 'Issue ID is required' });
    }

    const issue = await db.issue.findUnique({
      where: { id: issueId, deletedAt: null }
    });

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    await checkProjectAccess(user.id, issue.projectId);

    const summary = await generateIssueSummary(issueId, user.id);
    const remaining = await getRemainingRequests(user.id, 'summary');

    res.status(200).json({ 
      summary,
      remainingRequests: remaining
    });
  } catch (error) {
    console.error('AI summary error:', error);
    
    // Provide more specific error messages
    let statusCode = 500;
    let errorMessage = error.message || 'Failed to generate summary';
    
    if (error.message?.includes('API key') || error.message?.includes('invalid') || error.message?.includes('not configured')) {
      statusCode = 400;
      errorMessage = error.message || 'AI API key is invalid or not configured. Please check your .env file and restart the server.';
    } else if (error.message?.includes('Rate limit')) {
      statusCode = 429;
    } else if (error.message?.includes('too short')) {
      statusCode = 400;
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

