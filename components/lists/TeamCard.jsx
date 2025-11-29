// components/lists/TeamCard.jsx
'use client';

import Link from 'next/link';
import { Users, ArrowRight, FolderKanban } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

export default function TeamCard({ team }) {
  return (
    <Link href={`/teams/${team.id}`}>
      <Card hover>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold">{team.name}</h3>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{team._count?.members || 0} members</span>
          </div>
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4" />
            <span>{team._count?.projects || 0} projects</span>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Owner: {team.owner?.name}
            </p>
            {team._count?.issues > 0 && (
              <Badge variant="primary">
                {team._count.issues} issues
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

