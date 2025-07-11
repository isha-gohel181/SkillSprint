import React, { useState } from "react";
import { useProgress } from "@/hooks/useProgress";
import { useGoals } from "@/hooks/useGoals";
import { useTasks } from "@/hooks/useTasks";
import ProgressStats from "@/components/progress/ProgressStats";
import ProgressChart from "@/components/progress/ProgressChart";
import StreakCounter from "@/components/progress/StreakCounter";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Award,
  Trophy,
  Flame,
  Clock,
  CheckCircle
} from "lucide-react";

const ProgressPage = () => {
  const { overview, stats, streaks, chartData, loading, fetchChartData } = useProgress();
  const { goals } = useGoals();
  const { tasks, getTasksByStatus } = useTasks();
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");

  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
    fetchChartData("progress", timeframe);
  };

  if (loading) {
    return <LoadingSpinner>Loading your progress analytics...</LoadingSpinner>;
  }

  const completedGoals = goals.filter(g => g.status === "completed");
  const activeGoals = goals.filter(g => g.status === "active");
  const completedTasks = getTasksByStatus("completed");

  const achievements = [
    { 
      id: 1, 
      title: "First Goal", 
      description: "Created your first learning goal", 
      icon: "🎯", 
      earned: goals.length > 0,
      date: goals.length > 0 ? goals[0].createdAt : null
    },
    { 
      id: 2, 
      title: "Task Master", 
      description: "Completed 10 tasks", 
      icon: "✅", 
      earned: completedTasks.length >= 10,
      date: completedTasks.length >= 10 ? completedTasks[9]?.completedAt : null
    },
    { 
      id: 3, 
      title: "Streak Warrior", 
      description: "Maintained a 7-day streak", 
      icon: "🔥", 
      earned: streaks?.current >= 7,
      date: streaks?.current >= 7 ? new Date() : null
    },
    { 
      id: 4, 
      title: "Goal Achiever", 
      description: "Completed your first goal", 
      icon: "🏆", 
      earned: completedGoals.length > 0,
      date: completedGoals.length > 0 ? completedGoals[0].completedAt : null
    },
    { 
      id: 5, 
      title: "Consistency Champion", 
      description: "Completed tasks for 30 days", 
      icon: "💪", 
      earned: streaks?.longest >= 30,
      date: streaks?.longest >= 30 ? new Date() : null
    },
    { 
      id: 6, 
      title: "Learning Legend", 
      description: "Spent 100+ hours learning", 
      icon: "📚", 
      earned: overview?.totalTimeSpent >= 6000, // 100 hours in minutes
      date: overview?.totalTimeSpent >= 6000 ? new Date() : null
    }
  ];

  const earnedAchievements = achievements.filter(a => a.earned);
  const upcomingAchievements = achievements.filter(a => !a.earned).slice(0, 3);

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Progress Analytics</h1>
          <p className="text-muted-foreground">
            Track your learning journey and celebrate your achievements
          </p>
        </div>

        {/* Overview Stats */}
        <ProgressStats overview={overview} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Chart */}
            <ProgressChart
              chartData={chartData}
              timeframe={selectedTimeframe}
              onTimeframeChange={handleTimeframeChange}
            />

            {/* Goals Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Goals Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeGoals.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No active goals to track</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeGoals.slice(0, 5).map((goal) => {
                      const completedMilestones = goal.milestones.filter(m => m.completed).length;
                      const progress = (completedMilestones / goal.milestones.length) * 100;
                      
                      return (
                        <div key={goal._id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{goal.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {completedMilestones}/{goal.milestones.length} milestones completed
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-600">
                                {Math.round(progress)}%
                              </div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedTasks.slice(0, 5).map((task) => (
                    <div key={task._id} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div className="flex-1">
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {task.goalTitle} • {new Date(task.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {task.actualTime || task.estimatedTime}min
                      </Badge>
                    </div>
                  ))}
                  {completedTasks.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No completed tasks yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Streak Counter */}
            <StreakCounter streaks={streaks} />

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Earned Achievements */}
                <div>
                  <h4 className="text-sm font-medium mb-3">
                    Earned ({earnedAchievements.length})
                  </h4>
                  <div className="space-y-2">
                    {earnedAchievements.slice(0, 3).map((achievement) => (
                      <div key={achievement.id} className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{achievement.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {achievement.description}
                          </div>
                        </div>
                      </div>
                    ))}
                    {earnedAchievements.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Complete your first task to earn achievements!
                      </p>
                    )}
                  </div>
                </div>

                {/* Upcoming Achievements */}
                {upcomingAchievements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">
                      Coming Next
                    </h4>
                    <div className="space-y-2">
                      {upcomingAchievements.map((achievement) => (
                        <div key={achievement.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg opacity-60">
                          <div className="text-2xl grayscale">{achievement.icon}</div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{achievement.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {achievement.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>This Week</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats?.week?.tasksCompleted || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((stats?.week?.timeSpent || 0) / 60)}h
                    </div>
                    <div className="text-xs text-muted-foreground">Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats?.week?.goalsProgress || 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {stats?.week?.streakDays || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Streak</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ProgressPage;