import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Calendar, BookOpen, Edit, Trash2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  onComplete,
  onMarkInProgress,
  className 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'skipped':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'reading':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'practice':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'project':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'quiz':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'video':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'assignment':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const isCompleted = task.status === 'completed';

  return (
    <Card className={cn('relative overflow-hidden', className, {
      'opacity-75': isCompleted,
      'border-red-200 bg-red-50': isOverdue
    })}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className={cn(
              'text-lg font-semibold line-clamp-2',
              isCompleted && 'line-through text-muted-foreground'
            )}>
              {task.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
            {task.goalId && (
              <p className="text-xs text-muted-foreground mt-1">
                Goal: {task.goalId.title}
              </p>
            )}
          </div>
          <div className="flex gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(task)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(task._id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="outline" 
            className={getTypeColor(task.type)}
          >
            {task.type}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <div 
              className={cn('w-2 h-2 rounded-full', getPriorityColor(task.priority))}
            />
            {task.priority}
          </Badge>
          <Badge 
            variant="outline"
            className={cn(
              'flex items-center gap-1',
              isOverdue ? 'bg-red-100 text-red-800 border-red-200' : ''
            )}
          >
            <Calendar className="h-3 w-3" />
            {formatDate(task.dueDate)}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {task.estimatedDuration}min
          </Badge>
        </div>

        {/* Resources */}
        {task.resources && task.resources.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Resources:</h4>
            <div className="space-y-1">
              {task.resources.slice(0, 3).map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span className="truncate">{resource.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {resource.type}
                  </Badge>
                </a>
              ))}
              {task.resources.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{task.resources.length - 3} more resources
                </p>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {task.notes && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Notes:</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {task.notes}
            </p>
          </div>
        )}

        {/* Status and Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <div 
              className={cn('w-2 h-2 rounded-full', getStatusColor(task.status))}
            />
            <span className="text-sm capitalize">{task.status.replace('_', ' ')}</span>
            {task.completedAt && (
              <span className="text-xs text-muted-foreground">
                • {formatTime(task.completedAt)}
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            {task.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onMarkInProgress?.(task._id)}
              >
                Start
              </Button>
            )}
            {(task.status === 'pending' || task.status === 'in_progress') && (
              <Button
                size="sm"
                onClick={() => onComplete?.(task._id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete
              </Button>
            )}
          </div>
        </div>

        {/* Daily task indicator */}
        {task.isDaily && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs">
              Daily
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCard;