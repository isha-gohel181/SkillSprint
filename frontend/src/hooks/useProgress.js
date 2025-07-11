import { useState, useEffect } from "react";
import { progressAPI } from "@/lib/api";
import { toast } from "sonner";

export const useProgress = () => {
  const [overview, setOverview] = useState(null);
  const [stats, setStats] = useState(null);
  const [streaks, setStreaks] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await progressAPI.getOverview();
      setOverview(response.data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching progress overview:", err);
      // Use mock data for development when backend is not ready
      setOverview(mockOverview);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (timeframe = "week") => {
    try {
      const response = await progressAPI.getStats(timeframe);
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setStats(mockStats);
    }
  };

  const fetchStreaks = async () => {
    try {
      const response = await progressAPI.getStreaks();
      setStreaks(response.data);
    } catch (err) {
      console.error("Error fetching streaks:", err);
      setStreaks(mockStreaks);
    }
  };

  const fetchChartData = async (type, timeframe) => {
    try {
      const response = await progressAPI.getChartData(type, timeframe);
      setChartData(response.data);
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setChartData(mockChartData);
    }
  };

  const logActivity = async (activityData) => {
    try {
      await progressAPI.logActivity(activityData);
      toast.success("Activity logged successfully!");
      // Refresh overview after logging activity
      fetchOverview();
    } catch (err) {
      toast.error("Failed to log activity");
      throw err;
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchStats();
    fetchStreaks();
  }, []);

  return {
    overview,
    stats,
    streaks,
    chartData,
    loading,
    error,
    fetchStats,
    fetchChartData,
    logActivity,
    refetch: fetchOverview
  };
};

// Mock data for development
const mockOverview = {
  totalGoals: 3,
  activeGoals: 2,
  completedGoals: 0,
  totalTasks: 12,
  completedTasks: 3,
  pendingTasks: 9,
  currentStreak: 5,
  longestStreak: 12,
  totalTimeSpent: 1250, // minutes
  averageDaily: 45,
  completionRate: 75,
  weeklyProgress: [65, 70, 75, 80, 75, 85, 90],
  recentAchievements: [
    { id: 1, title: "First Goal Created", icon: "🎯", date: "2024-01-15" },
    { id: 2, title: "5-Day Streak", icon: "🔥", date: "2024-12-21" },
    { id: 3, title: "Task Master", icon: "✅", date: "2024-12-20" }
  ]
};

const mockStats = {
  week: {
    tasksCompleted: 8,
    timeSpent: 420,
    goalsProgress: 15,
    streakDays: 5
  },
  month: {
    tasksCompleted: 32,
    timeSpent: 1680,
    goalsProgress: 45,
    streakDays: 15
  },
  year: {
    tasksCompleted: 156,
    timeSpent: 7200,
    goalsProgress: 180,
    streakDays: 45
  }
};

const mockStreaks = {
  current: 5,
  longest: 12,
  history: [
    { date: "2024-12-16", active: true },
    { date: "2024-12-17", active: true },
    { date: "2024-12-18", active: true },
    { date: "2024-12-19", active: true },
    { date: "2024-12-20", active: true },
    { date: "2024-12-21", active: true },
    { date: "2024-12-22", active: false }
  ]
};

const mockChartData = {
  daily: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    data: [2, 4, 3, 5, 3, 2, 4]
  },
  weekly: {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    data: [12, 18, 15, 22]
  },
  monthly: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    data: [45, 52, 48, 65, 58, 72]
  }
};