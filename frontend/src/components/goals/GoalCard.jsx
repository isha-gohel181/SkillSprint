import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Target, 
  Clock, 
  TrendingUp, 
  Play, 
  Pause, 
  MoreHorizontal,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const GoalCard = ({ 
  goal, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  className 
}) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "paused": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const completedMilestones = goal.milestones.filter(m => m.completed).length;
  const progressPercentage = (completedMilestones / goal.milestones.length) * 100;

  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-2">{goal.title}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {goal.description}
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus(goal._id)}
              className="h-8 w-8 p-0"
            >
              {goal.status === "active" ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(goal)}
              className="h-8 w-8 p-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge className={getDifficultyColor(goal.difficulty)}>
            {goal.difficulty}
          </Badge>
          <Badge className={getStatusColor(goal.status)}>
            {goal.status}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {goal.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">
              {completedMilestones}/{goal.milestones.length} milestones
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="text-right text-sm font-medium text-primary">
            {Math.round(progressPercentage)}%
          </div>
        </div>

        {/* Milestones Preview */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Recent Milestones</div>
          <div className="space-y-1">
            {goal.milestones.slice(0, 3).map((milestone) => (
              <div key={milestone.id} className="flex items-center space-x-2 text-sm">
                <CheckCircle 
                  className={cn(
                    "h-4 w-4",
                    milestone.completed 
                      ? "text-green-500" 
                      : "text-gray-300"
                  )} 
                />
                <span className={cn(
                  milestone.completed 
                    ? "line-through text-muted-foreground" 
                    : ""
                )}>
                  {milestone.title}
                </span>
              </div>
            ))}
            {goal.milestones.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{goal.milestones.length - 3} more milestones
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>Due {new Date(goal.targetDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{goal.estimatedDuration}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onEdit(goal)}
          >
            <Target className="h-4 w-4 mr-1" />
            View Details
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Progress
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalCard;