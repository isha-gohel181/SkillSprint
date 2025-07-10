import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

export const useQuiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuizzesForGoal = async (goalId) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/quiz/goal/${goalId}`);
      setQuizzes(response.data.quizzes);
      setError(null);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError(err.response?.data?.error || 'Failed to fetch quizzes');
      toast.error('Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuiz = async (quizId) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/quiz/${quizId}`);
      setCurrentQuiz(response.data.quiz);
      setError(null);
      return response.data.quiz;
    } catch (err) {
      console.error('Error fetching quiz:', err);
      setError(err.response?.data?.error || 'Failed to fetch quiz');
      toast.error('Failed to fetch quiz');
      throw new Error(err.response?.data?.error || 'Failed to fetch quiz');
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async (quizId, answers, timeSpent, startedAt) => {
    try {
      setLoading(true);
      const response = await apiClient.post(`/quiz/${quizId}/submit`, {
        answers,
        timeSpent,
        startedAt
      });
      
      // Add to attempts list
      setAttempts(prev => [response.data.results, ...prev]);
      
      toast.success(`Quiz completed! Score: ${response.data.results.percentage}%`);
      return response.data.results;
    } catch (err) {
      console.error('Error submitting quiz:', err);
      const errorMessage = err.response?.data?.error || 'Failed to submit quiz';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttemptHistory = async () => {
    try {
      const response = await apiClient.get('/quiz/attempts/history');
      setAttempts(response.data.attempts);
    } catch (err) {
      console.error('Error fetching quiz history:', err);
      toast.error('Failed to fetch quiz history');
    }
  };

  const fetchAttemptDetails = async (attemptId) => {
    try {
      const response = await apiClient.get(`/quiz/attempts/${attemptId}`);
      return response.data.attempt;
    } catch (err) {
      console.error('Error fetching attempt details:', err);
      toast.error('Failed to fetch attempt details');
      throw new Error(err.response?.data?.error || 'Failed to fetch attempt details');
    }
  };

  const clearCurrentQuiz = () => {
    setCurrentQuiz(null);
  };

  return {
    quizzes,
    currentQuiz,
    attempts,
    loading,
    error,
    fetchQuizzesForGoal,
    fetchQuiz,
    submitQuiz,
    fetchAttemptHistory,
    fetchAttemptDetails,
    clearCurrentQuiz,
  };
};