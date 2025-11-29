// components/lists/ProjectCard.jsx
'use client';

import Link from 'next/link';
import { ArrowRight, FolderKanban, Users, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

export default function ProjectCard({ project }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card hover>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-1">{project.name}</h3>
            {project.isArchived && (
              <Badge variant="warning" className="text-xs">
                Archived
              </Badge>
            )}
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
        </div>
        
        {project.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {project.description}
          </p>
        )}
        
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Team: {project.team?.name}</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4" />
              <span>{project._count?.issues || 0} issues</span>
            </div>
            {project._count?.labels > 0 && (
              <Badge variant="default">
                {project._count.labels} labels
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

