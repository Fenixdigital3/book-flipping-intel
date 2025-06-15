
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className = ''
}) => {
  return (
    <Card className={`group animate-glass-float hover:animate-neon-pulse ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white/80 font-body">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg bg-neon-orange/20 group-hover:bg-neon-orange/30 transition-colors">
          <Icon className="h-4 w-4 text-neon-orange" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-header text-white mb-1">{value}</div>
        {subtitle && (
          <p className="text-xs text-white/60 font-body mt-1">
            {subtitle}
          </p>
        )}
        {trend && (
          <div className={`text-xs mt-2 font-medium ${
            trend.isPositive ? 'text-neon-lime' : 'text-red-400'
          }`}>
            <span className="inline-flex items-center">
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                trend.isPositive 
                  ? 'bg-neon-lime/20 text-neon-lime' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {trend.isPositive ? 'Up' : 'Down'}
              </span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
