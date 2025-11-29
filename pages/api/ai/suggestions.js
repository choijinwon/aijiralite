// pages/api/ai/suggestions.js
import { db } from '../../../lib/db';
import { authenticate } from '../../../lib/auth';
import { checkProjectAccess } from '../../../lib/permissions';
import { generateIssueSuggestions, getRemainingRequests } from '../../../lib/ai';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await authenticate(req);
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

    const suggestions = await generateIssueSuggestions(issueId, user.id);
    const remaining = await getRemainingRequests(user.id, 'suggestions');

    res.status(200).json({ 
      suggestions,
      remainingRequests: remaining
    });
  } catch (error) {
    console.error('AI suggestions error:', error);
    
    // Provide more specific error messages
    let statusCode = 500;
    let errorMessage = error.message || 'Failed to generate suggestions';
    
    if (error.message?.includes('API key') || error.message?.includes('invalid')) {
      statusCode = 400;
      errorMessage = 'OpenAI API key is invalid or not configured. Please check your .env file and restart the server.';
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

