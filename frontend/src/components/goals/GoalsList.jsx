import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import GoalCard from "./GoalCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { 
  Search, 
  Filter, 
  Plus, 
  Target,
  TrendingUp,
  Pause,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const GoalsList = ({ 
  goals, 
  loading, 
  onCreateNew, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const statusOptions = [
    { value: "all", label: "All Goals", icon: Target, count: goals.length },
    { 
      value: "active", 
      label: "Active", 
      icon: TrendingUp, 
      count: goals.filter(g => g.status === "active").length 
    },
    { 
      value: "completed", 
      label: "Completed", 
      icon: CheckCircle, 
      count: goals.filter(g => g.status === "completed").length 
    },
    { 
      value: "paused", 
      label: "Paused", 
      icon: Pause, 
      count: goals.filter(g => g.status === "paused").length 
    }
  ];

  const categories = [...new Set(goals.map(goal => goal.category).filter(Boolean))];

  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || goal.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || goal.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (loading) {
    return <LoadingSpinner>Loading your goals...</LoadingSpinner>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Goals</h1>
          <p className="text-muted-foreground">
            Track and manage your learning objectives
          </p>
        </div>
        <Button onClick={onCreateNew} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Goal</span>
        </Button>
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

        {/* Search and Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search goals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background text-sm rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {(searchTerm || statusFilter !== "all" || categoryFilter !== "all") && (
        <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-lg">
          <span className="text-sm text-muted-foreground">
            Showing {filteredGoals.length} of {goals.length} goals
          </span>
          {(searchTerm || statusFilter !== "all" || categoryFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">
            {goals.length === 0 ? "No goals yet" : "No goals match your filters"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {goals.length === 0 
              ? "Create your first learning goal to get started on your journey!"
              : "Try adjusting your search or filter criteria."
            }
          </p>
          {goals.length === 0 && (
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {goals.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-medium mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {goals.filter(g => g.status === "active").length}
              </div>
              <div className="text-sm text-muted-foreground">Active Goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {goals.filter(g => g.status === "completed").length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {Math.round(
                  goals.reduce((acc, goal) => {
                    const completed = goal.milestones.filter(m => m.completed).length;
                    return acc + (completed / goal.milestones.length) * 100;
                  }, 0) / goals.length
                )}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {categories.length}
              </div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsList;