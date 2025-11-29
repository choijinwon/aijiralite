// components/issue/AIFeatures.jsx
'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { api } from '../../utils/api';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

export default function AIFeatures({ issueId, projectId }) {
  const [summary, setSummary] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState({ summary: false, suggestions: false });
  const [error, setError] = useState(null);
  const [cacheStatus, setCacheStatus] = useState({ summary: false, suggestions: false });
  const [remainingRequests, setRemainingRequests] = useState({ summary: null, suggestions: null });

  // Load cached data on mount
  useEffect(() => {
    loadCachedData();
  }, [issueId]);

  const loadCachedData = async () => {
    try {
      const issue = await api.getIssue(issueId);
      if (issue.aiCache) {
        if (issue.aiCache.summary) {
          setSummary(issue.aiCache.summary);
          setCacheStatus(prev => ({ ...prev, summary: true }));
        }
        if (issue.aiCache.suggestions) {
          setSuggestions(issue.aiCache.suggestions);
          setCacheStatus(prev => ({ ...prev, suggestions: true }));
        }
      }
    } catch (error) {
      // Silently fail - cache loading is optional
    }
  };

  const handleGetSummary = async (forceRefresh = false) => {
    setLoading(prev => ({ ...prev, summary: true }));
    setError(null);
    try {
      const result = await api.getIssueSummary(issueId);
      setSummary(result.summary);
      setCacheStatus(prev => ({ ...prev, summary: true }));
      if (result.remainingRequests !== undefined) {
        setRemainingRequests(prev => ({ ...prev, summary: result.remainingRequests }));
      }
      if (!forceRefresh) {
        toast.success('Summary generated');
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to generate summary';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, summary: false }));
    }
  };

  const handleGetSuggestions = async (forceRefresh = false) => {
    setLoading(prev => ({ ...prev, suggestions: true }));
    setError(null);
    try {
      const result = await api.getIssueSuggestions(issueId);
      setSuggestions(result.suggestions);
      setCacheStatus(prev => ({ ...prev, suggestions: true }));
      if (result.remainingRequests !== undefined) {
        setRemainingRequests(prev => ({ ...prev, suggestions: result.remainingRequests }));
      }
      if (!forceRefresh) {
        toast.success('Suggestions generated');
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to generate suggestions';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, suggestions: false }));
    }
  };

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary-600" />
        <h3 className="font-semibold">AI Features</h3>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">AI Summary</span>
            <div className="flex items-center gap-2">
              {remainingRequests.summary !== null && (
                <span className="text-xs text-gray-500">
                  {remainingRequests.summary} requests left
                </span>
              )}
              {cacheStatus.summary && (
                <span className="text-xs text-gray-500">Cached</span>
              )}
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => handleGetSummary(false)}
            disabled={loading.summary}
            className="w-full"
          >
            {loading.summary ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : summary ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Summary
              </>
            ) : (
              'Generate Summary'
            )}
          </Button>
          {summary && (
            <div className="mt-2 p-3 bg-gray-50 rounded text-sm border border-gray-200">
              <p className="text-gray-700">{summary}</p>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">AI Suggestions</span>
            <div className="flex items-center gap-2">
              {remainingRequests.suggestions !== null && (
                <span className="text-xs text-gray-500">
                  {remainingRequests.suggestions} requests left
                </span>
              )}
              {cacheStatus.suggestions && (
                <span className="text-xs text-gray-500">Cached</span>
              )}
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => handleGetSuggestions(false)}
            disabled={loading.suggestions}
            className="w-full"
          >
            {loading.suggestions ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : suggestions ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Suggestions
              </>
            ) : (
              'Get Suggestions'
            )}
          </Button>
          {suggestions && (
            <div className="mt-2 p-3 bg-gray-50 rounded text-sm whitespace-pre-line border border-gray-200">
              <p className="text-gray-700">{suggestions}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

