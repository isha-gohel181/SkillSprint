import React, { useState } from 'react';
import { useGoals } from '@/hooks/useGoals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GoalCard from '@/components/GoalCard';
import GoalForm from '@/components/GoalForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Target, TrendingUp, CheckCircle } from 'lucide-react';

const GoalsPage = () => {
  const { 
    goals, 
    loading, 
    error, 
    createGoal, 
    updateGoal, 
    deleteGoal, 
    updateGoalProgress 
  } = useGoals();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateGoal = async (goalData) => {
    try {
      setIsSubmitting(true);
      await createGoal(goalData);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creating goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditGoal = async (goalData) => {
    try {
      setIsSubmitting(true);
      await updateGoal(editingGoal._id, goalData);
      setEditingGoal(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error updating goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoal(goalId);
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const handleEditClick = (goal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const handleUpdateProgress = (goalId, currentProgress) => {
    const newProgress = prompt(
      `Current progress: ${currentProgress}%\nEnter new progress (0-100):`, 
      currentProgress.toString()
    );
    
    if (newProgress !== null) {
      const progress = parseInt(newProgress);
      if (!isNaN(progress) && progress >= 0 && progress <= 100) {
        updateGoalProgress(goalId, progress);
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingGoal(null);
  };

  // Calculate stats
  const totalGoals = goals.length;
  const completedGoals = goals.filter(goal => goal.status === 'completed').length;
  const inProgressGoals = goals.filter(goal => goal.status === 'in_progress').length;
  const averageProgress = totalGoals > 0 
    ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / totalGoals)
    : 0;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Error loading goals: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Learning Goals</h1>
          <p className="text-muted-foreground">
            Track your learning journey and achieve your skill-building objectives
          </p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGoals}</div>
            <p className="text-xs text-muted-foreground">
              {inProgressGoals} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedGoals}</div>
            <p className="text-xs text-muted-foreground">
              {totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageProgress}%</div>
            <p className="text-xs text-muted-foreground">
              Across all goals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Card className="p-12">
          <CardContent className="text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first learning goal to get started on your skill-building journey
            </p>
            <Button 
              onClick={() => setIsFormOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {goals.map(goal => (
            <GoalCard
              key={goal._id}
              goal={goal}
              onEdit={handleEditClick}
              onDelete={handleDeleteGoal}
              onUpdateProgress={handleUpdateProgress}
            />
          ))}
        </div>
      )}

      {/* Goal Form Modal */}
      <GoalForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingGoal ? handleEditGoal : handleCreateGoal}
        initialData={editingGoal}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default GoalsPage;