import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

export const useTasks = (goalId = null) => {
  const [tasks, setTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (goalId) params.append('goalId', goalId);
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await apiClient.get(`/tasks?${params.toString()}`);
      setTasks(response.data.tasks);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.response?.data?.error || 'Failed to fetch tasks');
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayTasks = async () => {
    try {
      const response = await apiClient.get('/tasks/today');
      setTodayTasks(response.data.tasks);
    } catch (err) {
      console.error('Error fetching today\'s tasks:', err);
      toast.error('Failed to fetch today\'s tasks');
    }
  };

  const createTask = async (taskData) => {
    try {
      const response = await apiClient.post('/tasks', taskData);
      setTasks(prev => [response.data.task, ...prev]);
      toast.success('Task created successfully');
      return response.data.task;
    } catch (err) {
      console.error('Error creating task:', err);
      const errorMessage = err.response?.data?.error || 'Failed to create task';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      const response = await apiClient.put(`/tasks/${taskId}`, taskData);
      setTasks(prev => prev.map(task => 
        task._id === taskId ? response.data.task : task
      ));
      setTodayTasks(prev => prev.map(task => 
        task._id === taskId ? response.data.task : task
      ));
      toast.success('Task updated successfully');
      return response.data.task;
    } catch (err) {
      console.error('Error updating task:', err);
      const errorMessage = err.response?.data?.error || 'Failed to update task';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await apiClient.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(task => task._id !== taskId));
      setTodayTasks(prev => prev.filter(task => task._id !== taskId));
      toast.success('Task deleted successfully');
    } catch (err) {
      console.error('Error deleting task:', err);
      const errorMessage = err.response?.data?.error || 'Failed to delete task';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const completeTask = async (taskId, timeSpent = 0) => {
    try {
      const response = await apiClient.patch(`/tasks/${taskId}/complete`);
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task._id === taskId ? response.data.task : task
      ));
      setTodayTasks(prev => prev.map(task => 
        task._id === taskId ? response.data.task : task
      ));

      // Update progress
      if (timeSpent > 0) {
        await apiClient.patch('/progress/task-completed', { taskId, timeSpent });
      }

      toast.success('Task completed successfully');
      return response.data.task;
    } catch (err) {
      console.error('Error completing task:', err);
      const errorMessage = err.response?.data?.error || 'Failed to complete task';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchTodayTasks();
  }, [goalId]);

  return {
    tasks,
    todayTasks,
    loading,
    error,
    fetchTasks,
    fetchTodayTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
  };
};