import React, { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useGoals } from "@/hooks/useGoals";
import TaskCard from "@/components/tasks/TaskCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar,
  CheckCircle,
  Clock,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

const TasksPage = () => {
  const { goals } = useGoals();
  const { 
    tasks, 
    loading, 
    markComplete, 
    updateTask, 
    deleteTask,
    getTodaysTasks,
    getUpcomingTasks,
    getTasksByStatus
  } = useTasks();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [goalFilter, setGoalFilter] = useState("all");
  const [view, setView] = useState("all"); // all, today, upcoming

  const statusOptions = [
    { value: "all", label: "All Tasks", icon: Target, count: tasks.length },
    { 
      value: "pending", 
      label: "Pending", 
      icon: Clock, 
      count: getTasksByStatus("pending").length 
    },
    { 
      value: "in-progress", 
      label: "In Progress", 
      icon: Target, 
      count: getTasksByStatus("in-progress").length 
    },
    { 
      value: "completed", 
      label: "Completed", 
      icon: CheckCircle, 
      count: getTasksByStatus("completed").length 
    }
  ];

  const viewOptions = [
    { value: "all", label: "All Tasks", count: tasks.length },
    { value: "today", label: "Today", count: getTodaysTasks().length },
    { value: "upcoming", label: "Upcoming", count: getUpcomingTasks().length }
  ];

  const getFilteredTasks = () => {
    let filteredTasks = tasks;

    // Apply view filter
    if (view === "today") {
      filteredTasks = getTodaysTasks();
    } else if (view === "upcoming") {
      filteredTasks = getUpcomingTasks();
    }

    // Apply search filter
    if (searchTerm) {
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.goalTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
    }

    // Apply goal filter
    if (goalFilter !== "all") {
      filteredTasks = filteredTasks.filter(task => task.goalId === goalFilter);
    }

    return filteredTasks;
  };

  const filteredTasks = getFilteredTasks();

  const handleCompleteTask = async (taskId) => {
    try {
      await markComplete(taskId);
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const handleEditTask = (task) => {
    // TODO: Implement task editing modal
    console.log("Edit task:", task);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner>Loading your tasks...</LoadingSpinner>;
  }

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Tasks</h1>
            <p className="text-muted-foreground">
              Manage your daily learning activities
            </p>
          </div>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </Button>
        </div>

        {/* View Toggle */}
        <div className="flex flex-wrap gap-2">
          {viewOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setView(option.value)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors",
                view === option.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-gray-50 border-gray-200"
              )}
            >
              <span className="text-sm font-medium">{option.label}</span>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs",
                  view === option.value
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : ""
                )}
              >
                {option.count}
              </Badge>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors",
                    statusFilter === option.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-gray-50 border-gray-200"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{option.label}</span>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs",
                      statusFilter === option.value
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : ""
                    )}
                  >
                    {option.count}
                  </Badge>
                </button>
              );
            })}
          </div>

          {/* Search and Goal Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={goalFilter}
                onChange={(e) => setGoalFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background text-sm rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All Goals</option>
                {goals.map(goal => (
                  <option key={goal._id} value={goal._id}>
                    {goal.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {(searchTerm || statusFilter !== "all" || goalFilter !== "all" || view !== "all") && (
          <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
            <span className="text-sm text-muted-foreground">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setGoalFilter("all");
                setView("all");
              }}
            >
              Clear All
            </Button>
          </div>
        )}

        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">
              {tasks.length === 0 ? "No tasks yet" : "No tasks match your filters"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {tasks.length === 0 
                ? "Create your first task to start tracking your progress!"
                : "Try adjusting your search or filter criteria."
              }
            </p>
            {tasks.length === 0 && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Task
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onComplete={handleCompleteTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {tasks.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-medium mb-4">Task Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {getTasksByStatus("pending").length}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {getTasksByStatus("in-progress").length}
                </div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {getTasksByStatus("completed").length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {getTodaysTasks().length}
                </div>
                <div className="text-sm text-muted-foreground">Due Today</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default TasksPage;