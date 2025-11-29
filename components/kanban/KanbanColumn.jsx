// components/kanban/KanbanColumn.jsx
'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import IssueCard from './IssueCard';

export default function KanbanColumn({ title, issues, wipLimit, color }) {
  const { setNodeRef, isOver } = useDroppable({
    id: title,
  });

  const isAtLimit = wipLimit && issues.length >= wipLimit;

  return (
    <div className="flex-shrink-0 w-[260px] xs:w-[280px] sm:w-72 md:w-80">
      <div 
        ref={setNodeRef}
        className={`bg-white rounded-lg shadow-sm p-2.5 sm:p-3 md:p-4 min-h-[350px] sm:min-h-[400px] md:min-h-[500px] h-fit max-h-[calc(100vh-160px)] sm:max-h-[calc(100vh-180px)] overflow-y-auto ${
          isOver ? 'ring-2 ring-primary-500 ring-offset-2' : ''
        }`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4 sticky top-0 bg-white z-10 pb-2 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate flex-1 pr-2">{title}</h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs sm:text-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap ${
              isAtLimit ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {issues.length}{wipLimit ? ` / ${wipLimit}` : ''}
            </span>
          </div>
        </div>
        
        <SortableContext items={issues.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 sm:space-y-3">
            {issues.map(issue => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
            {issues.length === 0 && (
              <div className="text-center text-gray-400 py-8 text-xs sm:text-sm">
                No issues
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
