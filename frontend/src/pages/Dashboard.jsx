import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

// Import custom hooks
import { useGoals } from "@/hooks/useGoals";
import { useTasks } from "@/hooks/useTasks";
import { useProgress } from "@/hooks/useProgress";

// Import components
import ProgressStats from "@/components/progress/ProgressStats";
import StreakCounter from "@/components/progress/StreakCounter";
import TaskCard from "@/components/tasks/TaskCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";

import { 
  Target, 
  Plus, 
  TrendingUp, 
  Calendar,
  BookOpen,
  Quote,
  ArrowRight,
  CheckCircle,
  Clock
} from "lucide-react";

const Dashboard = () => {
  const { user } = useUser();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [motivationalQuote, setMotivationalQuote] = useState(null);

  // Custom hooks
  const { goals, loading: goalsLoading } = useGoals();
  const { tasks, getTodaysTasks, getUpcomingTasks, markComplete } = useTasks();
  const { overview, streaks, loading: progressLoading } = useProgress();

  const todaysTasks = getTodaysTasks();
  const upcomingTasks = getUpcomingTasks().slice(0, 5);
  const recentGoals = goals.filter(g => g.status === "active").slice(0, 3);

  useEffect(() => {
    fetchUserData();
    setMotivationalQuote({
      text: "The journey of a thousand miles begins with one step.",
      author: "Lao Tzu"
    });
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await apiClient.get("/users/me");
      setUserData(response.data.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await markComplete(taskId);
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  if (loading || goalsLoading || progressLoading) {
    return <LoadingSpinner>Loading your dashboard...</LoadingSpinner>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back, {user?.firstName || "Learner"}! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Ready to sprint towards your goals today?
          </p>
        </div>

        {/* Motivational Quote */}
        {motivationalQuote && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Quote className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <blockquote className="text-lg font-medium italic text-blue-900">
                    "{motivationalQuote.text}"
                  </blockquote>
                  <cite className="text-sm text-blue-700 mt-1">
                    — {motivationalQuote.author}
                  </cite>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Progress Overview Stats */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Progress Overview</h2>
        <ProgressStats overview={overview} />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Today's Tasks</span>
                </CardTitle>
                <CardDescription>
                  {todaysTasks.length} task{todaysTasks.length !== 1 ? 's' : ''} scheduled for today
                </CardDescription>
              </div>
              <Link to="/tasks">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {todaysTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-lg font-medium">All caught up!</p>
                  <p className="text-muted-foreground">No tasks scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaysTasks.slice(0, 3).map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      compact={true}
                      onComplete={handleCompleteTask}
                      onEdit={(task) => console.log("Edit task:", task)}
                    />
                  ))}
                  {todaysTasks.length > 3 && (
                    <div className="text-center pt-2">
                      <Link to="/tasks">
                        <Button variant="ghost" size="sm">
                          +{todaysTasks.length - 3} more tasks
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Goals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Active Goals</span>
                </CardTitle>
                <CardDescription>
                  Your current learning objectives
                </CardDescription>
              </div>
              <Link to="/goals">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentGoals.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                  <p className="text-lg font-medium">No active goals</p>
                  <p className="text-muted-foreground mb-4">
                    Create your first goal to start your learning journey
                  </p>
                  <Link to="/goals">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Goal
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentGoals.map((goal) => (
                    <div key={goal._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{goal.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {goal.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <span>{goal.category}</span>
                            <span>
                              {goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} milestones
                            </span>
                            <span>{Math.round((goal.milestones.filter(m => m.completed).length / goal.milestones.length) * 100)}% complete</span>
                          </div>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                          {Math.round((goal.milestones.filter(m => m.completed).length / goal.milestones.length) * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          {upcomingTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Upcoming Tasks</span>
                </CardTitle>
                <CardDescription>
                  Tasks due in the next 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      compact={true}
                      onComplete={handleCompleteTask}
                      onEdit={(task) => console.log("Edit task:", task)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Streak Counter */}
          <StreakCounter streaks={streaks} />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you can perform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/goals" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Goal
                </Button>
              </Link>
              <Link to="/tasks" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </Link>
              <Link to="/progress" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Progress
                </Button>
              </Link>
              <Link to="/quiz" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Take Quiz
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          {overview?.recentAchievements && overview.recentAchievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
                <CardDescription>Your latest accomplishments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overview.recentAchievements.slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3 p-2 rounded-lg bg-yellow-50">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{achievement.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(achievement.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
