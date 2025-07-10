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
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { sampleGoals, sampleTasks, sampleProgressData, sampleStreakData } from "@/services/mockData";
import { 
  Target, 
  CheckSquare, 
  TrendingUp, 
  Brain, 
  Flame, 
  Plus,
  ArrowRight,
  Calendar
} from "lucide-react";

const Dashboard = () => {
  const { user } = useUser();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await apiClient.get("/users/me");
      setUserData(response.data.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from mock data
  const activeGoals = sampleGoals.filter(goal => goal.status === 'active');
  const completedTasks = sampleTasks.filter(task => task.status === 'completed');
  const pendingTasks = sampleTasks.filter(task => task.status === 'pending');
  const avgProgress = activeGoals.reduce((sum, goal) => sum + goal.progress, 0) / (activeGoals.length || 1);
  
  // Recent activity from last 7 days
  const recentTasks = completedTasks.slice(-5);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.firstName || "User"}!</h1>
        <p className="text-muted-foreground">
          Here's your learning progress overview
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGoals.length}</div>
            <p className="text-xs text-muted-foreground">
              {avgProgress.toFixed(0)}% avg progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks.length} completed
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
              {sampleStreakData.longestStreak} longest
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sampleProgressData.slice(-7).reduce((sum, day) => sum + day.studyHours, 0)}h
            </div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Goals */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Active Goals</CardTitle>
              <Button size="sm" asChild>
                <Link to="/goals">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
            <CardDescription>Your current learning objectives</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeGoals.slice(0, 3).map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{goal.title}</span>
                  <span className="text-sm text-muted-foreground">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} />
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  Due {new Date(goal.targetDate).toLocaleDateString()}
                </div>
              </div>
            ))}
            
            <Button className="w-full" variant="outline" asChild>
              <Link to="/goals">
                <Plus className="h-4 w-4 mr-2" />
                Create New Goal
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Activity</CardTitle>
              <Button size="sm" asChild>
                <Link to="/tasks">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
            <CardDescription>Your latest completed tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <div key={task.id} className="flex items-start space-x-3">
                  <CheckSquare className="h-4 w-4 text-green-600 mt-1" />
                  <div className="flex-1">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Completed {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'recently'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No completed tasks yet. Start working on your goals!
              </div>
            )}
            
            <Button className="w-full" variant="outline" asChild>
              <Link to="/tasks">
                <Plus className="h-4 w-4 mr-2" />
                Create New Task
              </Link>
            </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild className="h-auto p-4 flex-col">
              <Link to="/goals">
                <Target className="h-6 w-6 mb-2" />
                <span>Set New Goal</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4 flex-col">
              <Link to="/tasks">
                <CheckSquare className="h-6 w-6 mb-2" />
                <span>Add Task</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4 flex-col">
              <Link to="/quizzes">
                <Brain className="h-6 w-6 mb-2" />
                <span>Take Quiz</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4 flex-col">
              <Link to="/progress">
                <TrendingUp className="h-6 w-6 mb-2" />
                <span>View Progress</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
