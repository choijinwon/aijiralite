// components/kanban/KanbanBoard.jsx
'use client';

import { useState } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import IssueCard from './IssueCard';
import { api } from '../../utils/api';

export default function KanbanBoard({ project, issues, onIssuesChange }) {
  const [activeIssue, setActiveIssue] = useState(null);
  
  // Get all statuses (default + custom)
  // Always show default statuses, even if no issues exist
  const defaultStatuses = ['Backlog', 'In Progress', 'Done'];
  const customStatuses = project.customStates?.map(cs => cs.name) || [];
  
  // Get unique statuses from issues (in case there are issues with other statuses)
  const issueStatuses = [...new Set(issues.map(i => i.status).filter(Boolean))];
  
  // Combine: default statuses + custom statuses + any other statuses from issues
  const allStatuses = [
    ...defaultStatuses,
    ...customStatuses.filter(cs => !defaultStatuses.includes(cs)),
    ...issueStatuses.filter(s => !defaultStatuses.includes(s) && !customStatuses.includes(s))
  ];

  const handleDragStart = (event) => {
    const issue = issues.find(i => i.id === event.active.id);
    setActiveIssue(issue);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveIssue(null);
    
    if (!over) return;
    
    const issueId = active.id;
    const newStatus = over.id;
    const issue = issues.find(i => i.id === issueId);
    
    if (issue && issue.status !== newStatus) {
      try {
        // Optimistic update
        const updatedIssues = issues.map(i => 
          i.id === issueId ? { ...i, status: newStatus } : i
        );
        onIssuesChange(updatedIssues);
        
        // API call
        await api.updateIssueStatus(issueId, newStatus);
      } catch (error) {
        console.error('Failed to update issue status:', error);
        // Revert optimistic update
        onIssuesChange(issues);
      }
    }
  };

  const getColumnIssues = (status) => {
    return issues
      .filter(issue => {
        // Handle null/undefined status - default to Backlog
        const issueStatus = issue.status || 'Backlog';
        return issueStatus === status;
      })
      .sort((a, b) => (a.position || 0) - (b.position || 0));
  };

  const getWipLimit = (status) => {
    if (defaultStatuses.includes(status)) return null;
    const customState = project.customStates?.find(cs => cs.name === status);
    return customState?.wipLimit || null;
  };

  return (
    <DndContext 
      collisionDetection={closestCenter}
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div 
        className="w-full overflow-x-auto bg-gray-50 kanban-scroll" 
        style={{ 
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9'
        }}
      >
        <div className="flex gap-2.5 sm:gap-3 md:gap-4 lg:gap-6 p-2.5 sm:p-3 md:p-4 lg:p-6 min-h-[calc(100vh-120px)] min-w-max pb-6">
          {allStatuses.map(status => (
            <KanbanColumn
              key={status}
              title={status}
              issues={getColumnIssues(status)}
              wipLimit={getWipLimit(status)}
              color={project.customStates?.find(cs => cs.name === status)?.color}
            />
          ))}
        </div>
      </div>
      
      <DragOverlay>
        {activeIssue && (
          <IssueCard 
            issue={activeIssue} 
            isDragging={true}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
