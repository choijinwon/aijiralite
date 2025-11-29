// components/dashboard/StatCard.jsx
'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card from '../ui/Card';

export default function StatCard({ title, value, subtitle, trend, icon: Icon }) {
  const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600';
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {Icon && <Icon className="w-5 h-5 text-gray-500" />}
            <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && trend !== 0 && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

