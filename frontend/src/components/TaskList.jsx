import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TaskCard from './TaskCard';
import LoadingSpinner from './LoadingSpinner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, CheckCircle } from 'lucide-react';

const TaskList = ({ 
  tasks = [], 
  loading = false, 
  title = "Tasks",
  emptyMessage = "No tasks found",
  onEdit,
  onDelete,
  onComplete,
  onMarkInProgress,
  showGoalFilter = false,
  selectedGoal = null,
  onGoalFilter,
  goals = []
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const groupTasksByStatus = (tasks) => {
    return tasks.reduce((acc, task) => {
      const status = task.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(task);
      return acc;
    }, {});
  };

  const groupedTasks = groupTasksByStatus(tasks);

  const getStatusDisplayName = (status) => {
    switch (status) {
      case 'pending':
        return 'To Do';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'skipped':
        return 'Skipped';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <BookOpen className="h-4 w-4" />;
      case 'in_progress':
        return <Calendar className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const statusOrder = ['pending', 'in_progress', 'completed', 'skipped'];

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} total
          </p>
        </div>
        
        {showGoalFilter && goals.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filter by goal:</span>
            <select
              value={selectedGoal || ''}
              onChange={(e) => onGoalFilter?.(e.target.value || null)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">All Goals</option>
              {goals.map(goal => (
                <option key={goal._id} value={goal._id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {tasks.length === 0 ? (
        <Card className="p-12">
          <CardContent className="text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Tasks</h3>
            <p className="text-muted-foreground">
              {emptyMessage}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {statusOrder.map(status => {
            const statusTasks = groupedTasks[status] || [];
            if (statusTasks.length === 0) return null;

            return (
              <div key={status} className="space-y-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <h3 className="text-lg font-semibold">
                    {getStatusDisplayName(status)}
                  </h3>
                  <Badge variant="secondary">
                    {statusTasks.length}
                  </Badge>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {statusTasks.map(task => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onComplete={onComplete}
                      onMarkInProgress={onMarkInProgress}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskList;