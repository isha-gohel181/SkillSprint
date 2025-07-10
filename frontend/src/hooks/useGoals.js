import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

export const useGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/goals');
      setGoals(response.data.goals);
      setError(null);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError(err.response?.data?.error || 'Failed to fetch goals');
      toast.error('Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData) => {
    try {
      const response = await apiClient.post('/goals', goalData);
      setGoals(prev => [response.data.goal, ...prev]);
      toast.success('Goal created successfully');
      return response.data.goal;
    } catch (err) {
      console.error('Error creating goal:', err);
      const errorMessage = err.response?.data?.error || 'Failed to create goal';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateGoal = async (goalId, goalData) => {
    try {
      const response = await apiClient.put(`/goals/${goalId}`, goalData);
      setGoals(prev => prev.map(goal => 
        goal._id === goalId ? response.data.goal : goal
      ));
      toast.success('Goal updated successfully');
      return response.data.goal;
    } catch (err) {
      console.error('Error updating goal:', err);
      const errorMessage = err.response?.data?.error || 'Failed to update goal';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      await apiClient.delete(`/goals/${goalId}`);
      setGoals(prev => prev.filter(goal => goal._id !== goalId));
      toast.success('Goal deleted successfully');
    } catch (err) {
      console.error('Error deleting goal:', err);
      const errorMessage = err.response?.data?.error || 'Failed to delete goal';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateGoalProgress = async (goalId, progress) => {
    try {
      const response = await apiClient.patch(`/goals/${goalId}/progress`, { progress });
      setGoals(prev => prev.map(goal => 
        goal._id === goalId ? response.data.goal : goal
      ));
      toast.success('Progress updated successfully');
      return response.data.goal;
    } catch (err) {
      console.error('Error updating progress:', err);
      const errorMessage = err.response?.data?.error || 'Failed to update progress';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return {
    goals,
    loading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress,
  };
};