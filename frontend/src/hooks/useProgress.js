import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

export const useProgress = (goalId = null) => {
  const [progress, setProgress] = useState([]);
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgress = async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (goalId) params.append('goalId', goalId);
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await apiClient.get(`/progress?${params.toString()}`);
      setProgress(response.data.progress);
      setError(null);
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError(err.response?.data?.error || 'Failed to fetch progress');
      toast.error('Failed to fetch progress');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await apiClient.get('/progress/summary');
      setSummary(response.data.summary);
    } catch (err) {
      console.error('Error fetching progress summary:', err);
      toast.error('Failed to fetch progress summary');
    }
  };

  const fetchChartData = async (goalId, days = 30) => {
    try {
      const response = await apiClient.get(`/progress/chart/${goalId}?days=${days}`);
      setChartData(response.data.chartData);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      toast.error('Failed to fetch chart data');
    }
  };

  const logProgress = async (progressData) => {
    try {
      const response = await apiClient.post('/progress', progressData);
      setProgress(prev => [response.data.progress, ...prev]);
      toast.success('Progress logged successfully');
      return response.data.progress;
    } catch (err) {
      console.error('Error logging progress:', err);
      const errorMessage = err.response?.data?.error || 'Failed to log progress';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateTaskProgress = async (taskId, timeSpent = 0) => {
    try {
      const response = await apiClient.patch('/progress/task-completed', { 
        taskId, 
        timeSpent 
      });
      
      // Update progress in local state
      setProgress(prev => {
        const existingIndex = prev.findIndex(p => 
          p.goalId === response.data.progress.goalId && 
          new Date(p.date).toDateString() === new Date(response.data.progress.date).toDateString()
        );
        
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = response.data.progress;
          return updated;
        } else {
          return [response.data.progress, ...prev];
        }
      });

      // Refresh summary to get updated stats
      fetchSummary();
      
      return response.data.progress;
    } catch (err) {
      console.error('Error updating task progress:', err);
      const errorMessage = err.response?.data?.error || 'Failed to update progress';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchProgress();
    fetchSummary();
  }, [goalId]);

  return {
    progress,
    summary,
    chartData,
    loading,
    error,
    fetchProgress,
    fetchSummary,
    fetchChartData,
    logProgress,
    updateTaskProgress,
  };
};