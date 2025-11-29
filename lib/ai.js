// lib/ai.js
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { db } from './db';
import crypto from 'crypto';

// AI Provider selection: 'openai' or 'claude'
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';

// Initialize AI clients with error handling
let openai;
let claude;
let apiKeyStatus = 'not_loaded';
let providerStatus = AI_PROVIDER;

function initializeOpenAI() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('OPENAI_API_KEY is not set.');
      return null;
    }

    const trimmedKey = apiKey.trim();
    if (trimmedKey.length === 0) {
      console.warn('OPENAI_API_KEY is empty.');
      return null;
    }

    const client = new OpenAI({
      apiKey: trimmedKey
    });
    
    return client;
  } catch (error) {
    console.error('Failed to initialize OpenAI client:', error);
    return null;
  }
}

function initializeClaude() {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.warn('ANTHROPIC_API_KEY is not set.');
      return null;
    }

    const trimmedKey = apiKey.trim();
    if (trimmedKey.length === 0) {
      console.warn('ANTHROPIC_API_KEY is empty.');
      return null;
    }

    const client = new Anthropic({
      apiKey: trimmedKey
    });
    
    return client;
  } catch (error) {
    console.error('Failed to initialize Claude client:', error);
    return null;
  }
}

// Initialize clients based on provider
function initializeAIProviders() {
  openai = initializeOpenAI();
  claude = initializeClaude();
  
  if (AI_PROVIDER === 'claude') {
    if (claude) {
      apiKeyStatus = 'loaded';
      providerStatus = 'claude';
    } else if (openai) {
      console.warn('Claude API not available, falling back to OpenAI');
      apiKeyStatus = 'loaded';
      providerStatus = 'openai';
    } else {
      apiKeyStatus = 'not_set';
    }
  } else {
    if (openai) {
      apiKeyStatus = 'loaded';
      providerStatus = 'openai';
    } else if (claude) {
      console.warn('OpenAI API not available, falling back to Claude');
      apiKeyStatus = 'loaded';
      providerStatus = 'claude';
    } else {
      apiKeyStatus = 'not_set';
    }
  }
}

// Initialize on module load
initializeAIProviders();

// Export functions
export function reinitializeAI() {
  initializeAIProviders();
  return { openai, claude };
}

export function getApiKeyStatus() {
  return { status: apiKeyStatus, provider: providerStatus };
}

export function getCurrentProvider() {
  return providerStatus;
}

function generateHash(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

// Rate limit configuration
const RATE_LIMIT_CONFIG = {
  windowMinutes: 1, // 1분 윈도우
  maxRequests: 20, // 1분당 최대 20회 요청
  retryAttempts: 2, // 최대 2번 재시도
  retryDelay: 1000 // 재시도 간격 (1초)
};

export async function checkAIRateLimit(userId, endpoint) {
  const window = new Date();
  window.setMinutes(window.getMinutes() - RATE_LIMIT_CONFIG.windowMinutes);

  const count = await db.aIRateLimit.count({
    where: {
      userId,
      endpoint,
      window: { gte: window }
    }
  });

  if (count >= RATE_LIMIT_CONFIG.maxRequests) {
    const remainingTime = RATE_LIMIT_CONFIG.windowMinutes * 60; // 초 단위
    throw new Error(`Rate limit exceeded. You can make ${RATE_LIMIT_CONFIG.maxRequests} requests per ${RATE_LIMIT_CONFIG.windowMinutes} minute(s). Please try again in a moment.`);
  }

  // Record this request
  await db.aIRateLimit.create({
    data: {
      userId,
      endpoint,
      window: new Date()
    }
  });
}

// Get remaining requests for user
export async function getRemainingRequests(userId, endpoint) {
  const window = new Date();
  window.setMinutes(window.getMinutes() - RATE_LIMIT_CONFIG.windowMinutes);

  const count = await db.aIRateLimit.count({
    where: {
      userId,
      endpoint,
      window: { gte: window }
    }
  });

  return Math.max(0, RATE_LIMIT_CONFIG.maxRequests - count);
}

// Retry wrapper for API calls
async function retryWithBackoff(fn, maxAttempts = RATE_LIMIT_CONFIG.retryAttempts, delay = RATE_LIMIT_CONFIG.retryDelay) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on authentication errors or rate limit errors
      if (error.status === 401 || error.code === 'invalid_api_key' || error.message?.includes('Rate limit')) {
        throw error;
      }
      
      // Retry on network errors, timeouts, or 5xx errors
      const isRetryable = 
        error.status >= 500 || 
        error.status === 429 || 
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.message?.includes('timeout') ||
        error.message?.includes('network');
      
      if (!isRetryable || attempt === maxAttempts) {
        throw error;
      }
      
      // Exponential backoff: delay * attempt
      const waitTime = delay * attempt;
      console.log(`API call failed (attempt ${attempt}/${maxAttempts}), retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
}

async function callAI(prompt, systemPrompt, options = {}) {
  const { maxTokens = 150, temperature = 0.3 } = options;
  const provider = getCurrentProvider();

  const makeClaudeCall = async () => {
    if (provider === 'claude' && claude) {
      const message = await claude.messages.create({
        model: options.model || 'claude-3-haiku-20240307',
        max_tokens: maxTokens,
        temperature: temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });
      
      // Claude returns content as an array of text blocks
      return message.content[0].text;
    }
    throw new Error('Claude API not available');
  };

  const makeOpenAICall = async () => {
    if (openai) {
      const completion = await openai.chat.completions.create({
        model: options.model || "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: temperature
      });
      return completion.choices[0].message.content;
    }
    throw new Error('OpenAI API not available');
  };

  try {
    if (provider === 'claude' && claude) {
      return await retryWithBackoff(makeClaudeCall);
    } else if (openai) {
      return await retryWithBackoff(makeOpenAICall);
    } else {
      const providerName = AI_PROVIDER === 'claude' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY';
      throw new Error(`No AI provider available. Please set ${providerName} in your .env file. Current provider setting: ${AI_PROVIDER}`);
    }
  } catch (error) {
    console.error('AI API error:', error);
    
    // Handle specific error types
    if (error.status === 401 || error.code === 'invalid_api_key') {
      const providerName = provider === 'claude' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY';
      throw new Error(`Invalid API key. Please check your ${providerName} in .env file and restart the server.`);
    }
    
    if (error.status === 429 || error.message?.includes('Rate limit')) {
      throw new Error('API rate limit exceeded. Please wait a moment and try again.');
    }
    
    if (error.status >= 500) {
      throw new Error(`AI service temporarily unavailable (${error.status}). Please try again in a moment.`);
    }
    
    throw new Error(`AI API error: ${error.message || 'Unknown error'}`);
  }
}

export async function generateIssueSummary(issueId, userId) {
  const { status, provider } = getApiKeyStatus();
  if (status === 'not_set') {
    const providerName = AI_PROVIDER === 'claude' ? 'Claude (ANTHROPIC_API_KEY)' : 'OpenAI (OPENAI_API_KEY)';
    throw new Error(`AI API key is not configured. Please set ${providerName} in your .env file. Current provider: ${AI_PROVIDER}`);
  }

  await checkAIRateLimit(userId, 'summary');

  const issue = await db.issue.findUnique({
    where: { id: issueId },
    include: { aiCache: true }
  });

  if (!issue) {
    throw new Error('Issue not found');
  }

  if (!issue.description || issue.description.length <= 10) {
    throw new Error('Description too short for AI processing');
  }

  const descriptionHash = generateHash(issue.description);
  
  // Check cache
  if (issue.aiCache?.summary && issue.aiCache.lastDescriptionHash === descriptionHash) {
    return issue.aiCache.summary;
  }

  const systemPrompt = "You are a helpful assistant that summarizes issue descriptions in 2-4 sentences. Focus on the main problem and key requirements.";
  const userPrompt = `Please summarize this issue description:\n\nTitle: ${issue.title}\nDescription: ${issue.description}`;
  
  const summary = await callAI(userPrompt, systemPrompt, { maxTokens: 150, temperature: 0.3 });

  // Save/update cache
  await db.issueAICache.upsert({
    where: { issueId },
    create: {
      issueId,
      summary,
      lastDescriptionHash: descriptionHash
    },
    update: {
      summary,
      lastDescriptionHash: descriptionHash
    }
  });

  return summary;
}

export async function generateIssueSuggestions(issueId, userId) {
  const { status, provider } = getApiKeyStatus();
  if (status === 'not_set') {
    const providerName = AI_PROVIDER === 'claude' ? 'Claude (ANTHROPIC_API_KEY)' : 'OpenAI (OPENAI_API_KEY)';
    throw new Error(`AI API key is not configured. Please set ${providerName} in your .env file. Current provider: ${AI_PROVIDER}`);
  }

  await checkAIRateLimit(userId, 'suggestions');

  const issue = await db.issue.findUnique({
    where: { id: issueId },
    include: { 
      aiCache: true,
      project: { include: { team: true } }
    }
  });

  if (!issue) {
    throw new Error('Issue not found');
  }

  if (!issue.description || issue.description.length <= 10) {
    throw new Error('Description too short for AI processing');
  }

  const descriptionHash = generateHash(issue.description);
  
  if (issue.aiCache?.suggestions && issue.aiCache.lastDescriptionHash === descriptionHash) {
    return issue.aiCache.suggestions;
  }

  const systemPrompt = "You are a helpful assistant that provides practical suggestions for resolving software issues. Give 3-5 specific actionable steps.";
  const userPrompt = `Please suggest approaches to resolve this issue:\n\nTitle: ${issue.title}\nDescription: ${issue.description}\n\nProvide practical, actionable suggestions.`;
  
  const suggestions = await callAI(userPrompt, systemPrompt, { maxTokens: 250, temperature: 0.5 });

  await db.issueAICache.upsert({
    where: { issueId },
    create: {
      issueId,
      suggestions,
      lastDescriptionHash: descriptionHash
    },
    update: {
      suggestions,
      lastDescriptionHash: descriptionHash
    }
  });

  return suggestions;
}

export async function detectDuplicateIssues(projectId, title, description) {
  const { status } = getApiKeyStatus();
  if (status === 'not_set') {
    console.warn('AI API is not configured. Skipping duplicate detection.');
    return [];
  }

  const existingIssues = await db.issue.findMany({
    where: { 
      projectId,
      deletedAt: null
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true
    },
    take: 20 // Limit for performance
  });

  if (existingIssues.length === 0) {
    return [];
  }

  const systemPrompt = `You are analyzing if a new issue is similar to existing issues. Return only a JSON array with similar issues.
Format: [{"id": "issue_id", "similarity": 0.8, "reason": "brief reason"}]
Only include issues with similarity > 0.7. Maximum 3 results.`;

  const userPrompt = `New issue:
Title: ${title}
Description: ${description}

Existing issues:
${existingIssues.map(issue => `ID: ${issue.id}\nTitle: ${issue.title}\nDescription: ${issue.description || 'No description'}\n---`).join('\n')}`;

  try {
    const response = await callAI(userPrompt, systemPrompt, { maxTokens: 300, temperature: 0.1 });
    const result = JSON.parse(response);
    return result.filter(item => item.similarity > 0.7).slice(0, 3);
  } catch (error) {
    console.error('Failed to parse AI duplicate detection response:', error);
    return [];
  }
}

export async function autoLabelIssue(issueId, projectId, userId) {
  const { status, provider } = getApiKeyStatus();
  if (status === 'not_set') {
    const providerName = AI_PROVIDER === 'claude' ? 'Claude (ANTHROPIC_API_KEY)' : 'OpenAI (OPENAI_API_KEY)';
    throw new Error(`AI API key is not configured. Please set ${providerName} in your .env file. Current provider: ${AI_PROVIDER}`);
  }

  await checkAIRateLimit(userId, 'auto-label');

  const issue = await db.issue.findUnique({
    where: { id: issueId }
  });

  if (!issue) {
    throw new Error('Issue not found');
  }

  const labels = await db.label.findMany({
    where: { projectId }
  });

  if (labels.length === 0) {
    return [];
  }

  const systemPrompt = `You are analyzing an issue and recommending labels. Return only a JSON array of label names that match the issue.
Format: ["label1", "label2"]
Only recommend labels that are relevant.`;

  const userPrompt = `Issue:
Title: ${issue.title}
Description: ${issue.description || 'No description'}

Available labels:
${labels.map(l => `- ${l.name}`).join('\n')}

Recommend relevant labels.`;

  try {
    const response = await callAI(userPrompt, systemPrompt, { maxTokens: 100, temperature: 0.3 });
    const recommendedLabels = JSON.parse(response);
    const validLabels = labels.filter(l => recommendedLabels.includes(l.name));
    return validLabels;
  } catch (error) {
    console.error('Failed to parse AI label recommendation:', error);
    return [];
  }
}

