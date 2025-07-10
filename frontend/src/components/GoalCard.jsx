import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Target, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const GoalCard = ({ 
  goal, 
  onEdit, 
  onDelete, 
  onUpdateProgress,
  className 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'paused':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'programming':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'design':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'marketing':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'business':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'personal':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500';
      case 'intermediate':
        return 'bg-yellow-500';
      case 'advanced':
        return 'bg-red-500';
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

  const isOverdue = new Date(goal.targetDate) < new Date() && goal.status !== 'completed';

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
        <div 
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${goal.progress}%` }}
        />
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {goal.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {goal.description}
            </p>
          </div>
          <div className="flex gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(goal)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(goal._id)}
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
            className={getCategoryColor(goal.category)}
          >
            {goal.category}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <div 
              className={cn('w-2 h-2 rounded-full', getDifficultyColor(goal.difficulty))}
            />
            {goal.difficulty}
          </Badge>
          <Badge 
            variant="outline"
            className={cn(
              'flex items-center gap-1',
              isOverdue ? 'bg-red-100 text-red-800 border-red-200' : ''
            )}
          >
            <Calendar className="h-3 w-3" />
            {formatDate(goal.targetDate)}
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>Progress</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">{goal.progress}%</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${goal.progress}%` }}
            />
          </div>
        </div>

        {/* Tags */}
        {goal.tags && goal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {goal.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {goal.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{goal.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className={cn('w-2 h-2 rounded-full', getStatusColor(goal.status))}
            />
            <span className="text-sm capitalize">{goal.status.replace('_', ' ')}</span>
          </div>
          
          {goal.status !== 'completed' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateProgress?.(goal._id, goal.progress)}
            >
              Update Progress
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalCard;