import { useState, useEffect } from "react";
import { tasksAPI } from "@/lib/api";
import { toast } from "sonner";

export const useTasks = (filters = {}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tasksAPI.getAll(filters);
      setTasks(response.data.tasks || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching tasks:", err);
      // Use mock data for development when backend is not ready
      setTasks(mockTasks);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData) => {
    try {
      const response = await tasksAPI.create(taskData);
      const newTask = response.data.task;
      setTasks(prev => [newTask, ...prev]);
      toast.success("Task created successfully!");
      return newTask;
    } catch (err) {
      toast.error("Failed to create task");
      throw err;
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const response = await tasksAPI.update(id, taskData);
      const updatedTask = response.data.task;
      setTasks(prev => prev.map(task => 
        task._id === id ? updatedTask : task
      ));
      toast.success("Task updated successfully!");
      return updatedTask;
    } catch (err) {
      toast.error("Failed to update task");
      throw err;
    }
  };

  const deleteTask = async (id) => {
    try {
      await tasksAPI.delete(id);
      setTasks(prev => prev.filter(task => task._id !== id));
      toast.success("Task deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete task");
      throw err;
    }
  };

  const markComplete = async (id) => {
    try {
      await tasksAPI.markComplete(id);
      setTasks(prev => prev.map(task => 
        task._id === id ? { ...task, status: "completed", completedAt: new Date() } : task
      ));
      toast.success("Task completed! 🎉");
    } catch (err) {
      toast.error("Failed to mark task complete");
      throw err;
    }
  };

  const getTodaysTasks = () => {
    const today = new Date().toDateString();
    return tasks.filter(task => 
      new Date(task.dueDate).toDateString() === today
    );
  };

  const getUpcomingTasks = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate <= nextWeek && task.status !== "completed";
    });
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const getTasksByGoal = (goalId) => {
    return tasks.filter(task => task.goalId === goalId);
  };

  useEffect(() => {
    fetchTasks();
  }, [JSON.stringify(filters)]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    markComplete,
    getTodaysTasks,
    getUpcomingTasks,
    getTasksByStatus,
    getTasksByGoal,
    refetch: fetchTasks
  };
};

// Mock data for development
const mockTasks = [
  {
    _id: "t1",
    title: "Setup React Development Environment",
    description: "Install Node.js, VS Code, and create first React app",
    goalId: "1",
    goalTitle: "Learn React Development",
    status: "completed",
    priority: "high",
    difficulty: "easy",
    estimatedTime: 60, // minutes
    actualTime: 45,
    dueDate: new Date("2024-01-16"),
    completedAt: new Date("2024-01-16"),
    resources: [
      { title: "React Official Docs", url: "https://react.dev" },
      { title: "Node.js Installation Guide", url: "https://nodejs.org" }
    ],
    tags: ["setup", "environment"]
  },
  {
    _id: "t2",
    title: "Complete React Tutorial",
    description: "Work through the official React tutorial",
    goalId: "1",
    goalTitle: "Learn React Development",
    status: "in-progress",
    priority: "high",
    difficulty: "medium",
    estimatedTime: 120,
    actualTime: null,
    dueDate: new Date("2024-12-22"),
    completedAt: null,
    resources: [
      { title: "React Tutorial", url: "https://react.dev/learn/tutorial-tic-tac-toe" }
    ],
    tags: ["tutorial", "learning"]
  },
  {
    _id: "t3",
    title: "Build Todo App",
    description: "Create a fully functional todo application",
    goalId: "1",
    goalTitle: "Learn React Development",
    status: "pending",
    priority: "medium",
    difficulty: "medium",
    estimatedTime: 180,
    actualTime: null,
    dueDate: new Date("2024-12-25"),
    completedAt: null,
    resources: [],
    tags: ["project", "practice"]
  },
  {
    _id: "t4",
    title: "Practice Toastmasters Speech #1",
    description: "Prepare and practice first Toastmasters speech",
    goalId: "2",
    goalTitle: "Improve Public Speaking",
    status: "pending",
    priority: "high",
    difficulty: "medium",
    estimatedTime: 90,
    actualTime: null,
    dueDate: new Date("2024-12-23"),
    completedAt: null,
    resources: [
      { title: "Toastmasters Manual", url: "https://toastmasters.org" }
    ],
    tags: ["practice", "speech"]
  },
  {
    _id: "t5",
    title: "Read React Advanced Patterns",
    description: "Study advanced React patterns and best practices",
    goalId: "1",
    goalTitle: "Learn React Development",
    status: "pending",
    priority: "low",
    difficulty: "hard",
    estimatedTime: 240,
    actualTime: null,
    dueDate: new Date("2024-12-28"),
    completedAt: null,
    resources: [
      { title: "React Patterns", url: "https://reactpatterns.com" }
    ],
    tags: ["reading", "advanced"]
  }
];