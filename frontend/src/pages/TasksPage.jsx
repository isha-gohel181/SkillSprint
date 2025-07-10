import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useGoals } from '@/hooks/useGoals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, BookOpen, CheckCircle, Clock, Calendar } from 'lucide-react';

const TasksPage = () => {
  const { 
    tasks, 
    todayTasks,
    loading, 
    error, 
    createTask, 
    updateTask, 
    deleteTask, 
    completeTask 
  } = useTasks();

  const { goals } = useGoals();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'today', 'pending', 'completed'

  const handleCreateTask = async (taskData) => {
    try {
      setIsSubmitting(true);
      await createTask(taskData);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      setIsSubmitting(true);
      await updateTask(editingTask._id, taskData);
      setEditingTask(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await completeTask(taskId, 0); // TODO: Add time tracking
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleMarkInProgress = async (taskId) => {
    try {
      await updateTask(taskId, { status: 'in_progress' });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleGoalFilter = (goalId) => {
    setSelectedGoal(goalId);
  };

  // Filter tasks based on active tab and selected goal
  const getFilteredTasks = () => {
    let filtered = tasks;

    // Filter by goal if selected
    if (selectedGoal) {
      filtered = filtered.filter(task => 
        task.goalId && (task.goalId._id === selectedGoal || task.goalId === selectedGoal)
      );
    }

    // Filter by tab
    switch (activeTab) {
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return filtered.filter(task => {
          const taskDate = new Date(task.dueDate);
          return taskDate >= today && taskDate < tomorrow;
        });
      case 'pending':
        return filtered.filter(task => task.status === 'pending');
      case 'completed':
        return filtered.filter(task => task.status === 'completed');
      default:
        return filtered;
    }
  };

  const filteredTasks = getFilteredTasks();

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const todayTasksCount = todayTasks.length;
  const completedTodayTasks = todayTasks.filter(task => task.status === 'completed').length;

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
        
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        
        <Skeleton className="h-12 w-full" />
        
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
            <p className="text-red-600">Error loading tasks: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'all', label: 'All Tasks', count: tasks.length },
    { id: 'today', label: "Today's Tasks", count: todayTasksCount },
    { id: 'pending', label: 'Pending', count: pendingTasks },
    { id: 'completed', label: 'Completed', count: completedTasks },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your daily learning tasks and track progress
          </p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {pendingTasks} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTodayTasks}</div>
            <p className="text-xs text-muted-foreground">
              of {todayTasksCount} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTasks > 0 
                ? Math.round(tasks.reduce((sum, task) => sum + task.estimatedDuration, 0) / totalTasks)
                : 0}m
            </div>
            <p className="text-xs text-muted-foreground">
              per task
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Goal Filter */}
        {goals.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filter by goal:</span>
            <select
              value={selectedGoal || ''}
              onChange={(e) => handleGoalFilter(e.target.value || null)}
              className="flex h-9 w-48 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">All Goals</option>
              {goals.map(goal => (
                <option key={goal._id} value={goal._id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Card className="p-12">
          <CardContent className="text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
            <p className="text-muted-foreground mb-4">
              {activeTab === 'all' && !selectedGoal
                ? "Create your first task to get started with your learning journey"
                : activeTab === 'today'
                ? "No tasks scheduled for today"
                : `No ${activeTab} tasks found`}
            </p>
            <Button 
              onClick={() => setIsFormOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TaskList
          tasks={filteredTasks}
          title={tabs.find(tab => tab.id === activeTab)?.label}
          onEdit={handleEditClick}
          onDelete={handleDeleteTask}
          onComplete={handleCompleteTask}
          onMarkInProgress={handleMarkInProgress}
          showGoalFilter={false} // We have our own filter above
          goals={goals}
        />
      )}

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingTask ? handleEditTask : handleCreateTask}
        initialData={editingTask}
        isLoading={isSubmitting}
        goals={goals}
      />
    </div>
  );
};

export default TasksPage;