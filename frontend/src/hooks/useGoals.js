import { useState, useEffect } from "react";
import { goalsAPI } from "@/lib/api";
import { toast } from "sonner";

export const useGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await goalsAPI.getAll();
      setGoals(response.data.goals || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching goals:", err);
      // Use mock data for development when backend is not ready
      setGoals(mockGoals);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData) => {
    try {
      const response = await goalsAPI.create(goalData);
      const newGoal = response.data.goal;
      setGoals(prev => [newGoal, ...prev]);
      toast.success("Goal created successfully!");
      return newGoal;
    } catch (err) {
      toast.error("Failed to create goal");
      throw err;
    }
  };

  const updateGoal = async (id, goalData) => {
    try {
      const response = await goalsAPI.update(id, goalData);
      const updatedGoal = response.data.goal;
      setGoals(prev => prev.map(goal => 
        goal._id === id ? updatedGoal : goal
      ));
      toast.success("Goal updated successfully!");
      return updatedGoal;
    } catch (err) {
      toast.error("Failed to update goal");
      throw err;
    }
  };

  const deleteGoal = async (id) => {
    try {
      await goalsAPI.delete(id);
      setGoals(prev => prev.filter(goal => goal._id !== id));
      toast.success("Goal deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete goal");
      throw err;
    }
  };

  const generateBreakdown = async (goalData) => {
    try {
      const response = await goalsAPI.generateBreakdown(goalData);
      return response.data.breakdown;
    } catch (err) {
      toast.error("Failed to generate goal breakdown");
      throw err;
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    generateBreakdown,
    refetch: fetchGoals
  };
};

// Mock data for development
const mockGoals = [
  {
    _id: "1",
    title: "Learn React Development",
    description: "Master React.js and modern frontend development",
    category: "Programming",
    difficulty: "intermediate",
    estimatedDuration: "3 months",
    status: "active",
    progress: 65,
    milestones: [
      { id: "m1", title: "Setup Development Environment", completed: true },
      { id: "m2", title: "Learn React Basics", completed: true },
      { id: "m3", title: "Build First App", completed: false },
      { id: "m4", title: "Advanced Patterns", completed: false }
    ],
    createdAt: new Date("2024-01-15"),
    targetDate: new Date("2024-04-15")
  },
  {
    _id: "2", 
    title: "Improve Public Speaking",
    description: "Develop confidence and skills in public speaking",
    category: "Communication",
    difficulty: "beginner",
    estimatedDuration: "2 months",
    status: "active",
    progress: 30,
    milestones: [
      { id: "m1", title: "Join Toastmasters", completed: true },
      { id: "m2", title: "Give First Speech", completed: false },
      { id: "m3", title: "Practice Weekly", completed: false }
    ],
    createdAt: new Date("2024-02-01"),
    targetDate: new Date("2024-04-01")
  },
  {
    _id: "3",
    title: "Learn Data Science",
    description: "Master Python, statistics, and machine learning",
    category: "Data Science",
    difficulty: "advanced",
    estimatedDuration: "6 months",
    status: "paused",
    progress: 15,
    milestones: [
      { id: "m1", title: "Python Fundamentals", completed: true },
      { id: "m2", title: "Statistics & Probability", completed: false },
      { id: "m3", title: "Machine Learning", completed: false },
      { id: "m4", title: "Deep Learning", completed: false }
    ],
    createdAt: new Date("2024-01-01"),
    targetDate: new Date("2024-07-01")
  }
];