import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ProgressChartTabs } from '@/components/progress/ProgressChart';
import { sampleProgressData, sampleStreakData, sampleAchievements, sampleGoals } from '@/services/mockData';
import { TrendingUp, Target, Calendar, Award, Flame, Clock } from 'lucide-react';

const ProgressPage = () => {
  const totalGoals = sampleGoals.length;
  const completedGoals = sampleGoals.filter(goal => goal.status === 'completed').length;
  const activeGoals = sampleGoals.filter(goal => goal.status === 'active').length;
  const goalCompletionRate = (completedGoals / totalGoals) * 100;

  const totalTasks = sampleProgressData.reduce((sum, day) => sum + day.completedTasks, 0);
  const avgDailyTasks = totalTasks / sampleProgressData.length;
  const totalStudyHours = sampleProgressData.reduce((sum, day) => sum + day.studyHours, 0);
  const avgScore = sampleProgressData.reduce((sum, day) => sum + day.score, 0) / sampleProgressData.length;

  const earnedAchievements = sampleAchievements.filter(achievement => achievement.earned);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Progress Analytics</h1>
        <p className="text-muted-foreground">
          Track your learning journey and achievements
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {avgDailyTasks.toFixed(1)} avg per day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudyHours}h</div>
            <p className="text-xs text-muted-foreground">
              {(totalStudyHours / sampleProgressData.length).toFixed(1)}h avg per day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleStreakData.currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              {sampleStreakData.longestStreak} longest streak
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              Quiz performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goal Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Goal Progress</CardTitle>
            <CardDescription>Your progress towards completing goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Goal Completion Rate</span>
                <span>{goalCompletionRate.toFixed(0)}%</span>
              </div>
              <Progress value={goalCompletionRate} />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{totalGoals}</div>
                <div className="text-xs text-muted-foreground">Total Goals</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{completedGoals}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{activeGoals}</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
            </div>

            <div className="space-y-3">
              {sampleGoals.map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="truncate">{goal.title}</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>Your earned badges and milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {sampleAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border ${
                    achievement.earned
                      ? 'bg-primary/10 border-primary/20'
                      : 'bg-muted/50 border-muted'
                  }`}
                >
                  <div className="text-center space-y-2">
                    <div className={`text-2xl ${achievement.earned ? '' : 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </div>
                    <div className="text-sm font-medium">{achievement.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {achievement.description}
                    </div>
                    {achievement.earned && achievement.earnedAt && (
                      <div className="text-xs text-primary">
                        Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <div className="text-sm text-muted-foreground">
                {earnedAchievements.length} of {sampleAchievements.length} achievements earned
              </div>
              <Progress 
                value={(earnedAchievements.length / sampleAchievements.length) * 100} 
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <ProgressChartTabs data={sampleProgressData} />

      {/* Learning Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Insights</CardTitle>
          <CardDescription>AI-powered insights about your progress</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-900 dark:text-blue-100">
                  Great Progress!
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-200">
                  You've completed {totalTasks} tasks in the last 30 days. Your consistency is improving!
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-start space-x-3">
              <Award className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-green-900 dark:text-green-100">
                  Quiz Performance
                </div>
                <div className="text-sm text-green-700 dark:text-green-200">
                  Your average quiz score of {avgScore.toFixed(0)}% shows excellent understanding. Keep it up!
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <div className="font-medium text-orange-900 dark:text-orange-100">
                  Recommendation
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-200">
                  Try to maintain at least 2 hours of study time daily to reach your goals faster.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressPage;