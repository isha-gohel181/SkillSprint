import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, Clock, Target } from 'lucide-react';

const ProgressStats = ({ summary, className }) => {
  if (!summary) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No progress data available</p>
        </CardContent>
      </Card>
    );
  }

  const completionRate = summary.totalGoals > 0 
    ? Math.round((summary.completedGoals / summary.totalGoals) * 100) 
    : 0;

  const todayCompletionRate = summary.todayTotalTasks > 0 
    ? Math.round((summary.todayTasksCompleted / summary.todayTotalTasks) * 100) 
    : 0;

  return (
    <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.todayTasksCompleted}</div>
          <p className="text-xs text-muted-foreground">
            of {summary.todayTotalTasks} tasks completed
          </p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${todayCompletionRate}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.currentStreak}</div>
          <p className="text-xs text-muted-foreground">
            consecutive days
          </p>
          <div className="mt-2 flex gap-1">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < (summary.currentStreak % 7) ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Goals Progress</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.completedGoals}</div>
          <p className="text-xs text-muted-foreground">
            of {summary.totalGoals} goals completed
          </p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Time Today</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.timeSpentToday}m</div>
          <p className="text-xs text-muted-foreground">
            learning time
          </p>
          {summary.achievements && summary.achievements.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {summary.achievements.slice(0, 2).map((achievement, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {achievement}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressStats;