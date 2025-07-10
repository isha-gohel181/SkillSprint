import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useProgress } from "@/hooks/useProgress";
import { useGoals } from "@/hooks/useGoals";
import { useTasks } from "@/hooks/useTasks";
import LoadingSpinner from "@/components/LoadingSpinner";
import GoalCard from "@/components/GoalCard";
import { 
  Target, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Calendar,
  Flame,
  BookOpen,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useUser();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { summary: progressSummary } = useProgress();
  const { goals } = useGoals();
  const { todayTasks } = useTasks();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await apiClient.get("/users/me");
      setUserData(response.data.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const testProtectedRoute = async () => {
    try {
      const response = await apiClient.get("/auth/me");
      toast.success("Protected route accessed successfully!");
      console.log("Protected route response:", response.data);
    } catch (error) {
      toast.error("Failed to access protected route");
    }
  };

  // Filter recent goals (in progress and not started)
  const activeGoals = goals.filter(goal => 
    goal.status === 'in_progress' || goal.status === 'not_started'
  ).slice(0, 3);

  const completedTodayTasks = todayTasks.filter(task => task.status === 'completed').length;
  const pendingTodayTasks = todayTasks.filter(task => task.status === 'pending').length;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.firstName || "Learner"}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's your learning progress and today's tasks
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTodayTasks}</div>
            <p className="text-xs text-muted-foreground">
              of {todayTasks.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progressSummary?.currentStreak || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              days in a row
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progressSummary?.totalGoals || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {progressSummary?.completedGoals || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progressSummary?.timeSpentToday || 0}m
            </div>
            <p className="text-xs text-muted-foreground">
              learning time
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today's Tasks
                </CardTitle>
                <CardDescription>Your scheduled learning tasks</CardDescription>
              </div>
              <Link to="/tasks">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No tasks scheduled for today</p>
                <Link to="/tasks">
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {todayTasks.slice(0, 5).map(task => (
                  <div key={task._id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      task.status === 'completed' ? 'bg-green-500' : 
                      task.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                    <div className="flex-1">
                      <p className={`font-medium ${
                        task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                      }`}>
                        {task.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {task.goalId?.title} • {task.estimatedDuration}min
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {task.type}
                    </Badge>
                  </div>
                ))}
                {todayTasks.length > 5 && (
                  <div className="text-center pt-2">
                    <Link to="/tasks">
                      <Button variant="ghost" size="sm">
                        View {todayTasks.length - 5} more tasks
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Goals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Active Goals
                </CardTitle>
                <CardDescription>Your current learning objectives</CardDescription>
              </div>
              <Link to="/goals">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeGoals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active goals</p>
                <Link to="/goals">
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Goal
                  </Button>
                </Link>
              </div>
            ) : (
              activeGoals.map(goal => (
                <div key={goal._id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium line-clamp-1">{goal.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {goal.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {goal.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with your learning journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/goals">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                <Target className="h-6 w-6" />
                <span>Create Goal</span>
              </Button>
            </Link>
            <Link to="/tasks">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                <BookOpen className="h-6 w-6" />
                <span>Add Task</span>
              </Button>
            </Link>
            <Link to="/progress">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                <span>View Progress</span>
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={testProtectedRoute}
              className="w-full h-auto p-4 flex flex-col items-center gap-2"
            >
              <CheckCircle className="h-6 w-6" />
              <span>Test API</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
