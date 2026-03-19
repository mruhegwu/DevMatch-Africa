'use client';

import { Task } from '@/lib/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, CheckCircle, Clock } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onApply?: (taskId: string) => void;
  isApplying?: boolean;
}

// Status badge colors
const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  accepted: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

export default function TaskCard({ task, onApply, isApplying }: TaskCardProps) {
  const hasApplied = task.applied;
  const status = task.applicationStatus;

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{task.title}</CardTitle>
          <div className="flex items-center gap-1 text-green-600 shrink-0">
            <DollarSign className="h-4 w-4" />
            <span className="font-bold text-sm">{task.budget.toLocaleString()}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">{task.description}</p>

        {/* Required skills */}
        <div className="flex flex-wrap gap-1.5">
          {task.skillsRequired.map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        {hasApplied ? (
          <div className="flex items-center gap-2 w-full">
            <Badge
              className={`text-xs border flex items-center gap-1 ${
                statusColors[status || 'pending']
              }`}
              variant="outline"
            >
              {status === 'accepted' ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Applied'}
            </Badge>
          </div>
        ) : (
          <Button
            className="w-full"
            size="sm"
            onClick={() => onApply?.(task.id)}
            disabled={isApplying}
          >
            {isApplying ? 'Applying...' : 'Apply Now'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
