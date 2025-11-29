// components/issue/AutoLabelButton.jsx
'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { api } from '../../utils/api';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

export default function AutoLabelButton({ issueId, projectId, onLabelsApplied }) {
  const [loading, setLoading] = useState(false);

  const handleAutoLabel = async () => {
    setLoading(true);
    try {
      const result = await api.autoLabelIssue(issueId, projectId);
      if (result.labels && result.labels.length > 0) {
        toast.success(`Applied ${result.labels.length} label(s)`);
        if (onLabelsApplied) {
          onLabelsApplied(result.labels.map(l => l.id));
        }
      } else {
        toast.info('No relevant labels found');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to auto-label issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleAutoLabel}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 mr-2" />
          Auto Label
        </>
      )}
    </Button>
  );
}

