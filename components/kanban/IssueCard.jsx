// components/kanban/IssueCard.jsx
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { PRIORITY_COLORS } from '../../utils/constants';
import { getInitials } from '../../lib/utils';

export default function IssueCard({ issue, isDragging = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: issue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white border border-gray-200 rounded-lg p-3 sm:p-4 cursor-move hover:shadow-md active:shadow-lg transition-shadow select-none ${
        isDragging ? 'shadow-lg opacity-90' : ''
      }`}
    >
      <Link 
        href={`/issues/${issue.id}`} 
        className="block"
        onClick={(e) => {
          // Prevent navigation when dragging
          if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onMouseDown={(e) => {
          // Allow drag to start
          if (e.button === 0) {
            e.stopPropagation();
          }
        }}
      >
        <div className="flex items-start justify-between mb-2 gap-2">
          <h4 className="font-medium text-gray-900 text-xs sm:text-sm flex-1 line-clamp-2 min-w-0">
            {issue.title}
          </h4>
          <span className={`text-xs px-1.5 sm:px-2 py-0.5 rounded border flex-shrink-0 ${PRIORITY_COLORS[issue.priority] || PRIORITY_COLORS.MEDIUM}`}>
            {issue.priority}
          </span>
        </div>
        
        {issue.labelIssues && issue.labelIssues.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {issue.labelIssues.slice(0, 3).map(li => (
              <span
                key={li.label.id}
                className="px-1.5 py-0.5 rounded text-xs"
                style={{ backgroundColor: `${li.label.color}20`, color: li.label.color }}
              >
                {li.label.name}
              </span>
            ))}
            {issue.labelIssues.length > 3 && (
              <span className="text-xs text-gray-500">+{issue.labelIssues.length - 3}</span>
            )}
          </div>
        )}
        
        {issue.description && (
          <p className="text-xs text-gray-600 mb-2 sm:mb-3 line-clamp-2">
            {issue.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {issue.assignee ? (
              <div className="flex items-center gap-1 flex-shrink-0 relative">
                {issue.assignee.avatar ? (
                  <img 
                    src={issue.assignee.avatar} 
                    alt={issue.assignee.name}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.nextElementSibling;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div 
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center flex-shrink-0 ${
                    issue.assignee.avatar ? 'hidden' : ''
                  }`}
                >
                  {getInitials(issue.assignee.name || 'U')}
                </div>
              </div>
            ) : (
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-200 flex-shrink-0"></div>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {issue.labelIssues && issue.labelIssues.length > 0 && (
              <div className="flex gap-0.5 sm:gap-1">
                {issue.labelIssues.slice(0, 3).map(li => (
                  <span
                    key={li.label.id}
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                    style={{ backgroundColor: li.label.color }}
                    title={li.label.name}
                  />
                ))}
              </div>
            )}
            {issue._count && (
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {issue._count.comments || 0} 💬
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
