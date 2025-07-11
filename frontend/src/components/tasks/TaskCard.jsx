import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Calendar, 
  Target, 
  CheckCircle, 
  ExternalLink,
  Play,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

const TaskCard = ({ 
  task, 
  onComplete, 
  onEdit, 
  onDelete,
  compact = false 
}) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "completed";
  const isDueToday = new Date(task.dueDate).toDateString() === new Date().toDateString();

  if (compact) {
    return (
      <div className={cn(
        "flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors",
        task.status === "completed" && "opacity-60",
        isOverdue && "border-red-200 bg-red-50"
      )}>
        <button
          onClick={() => onComplete(task._id)}
          disabled={task.status === "completed"}
        >
          <CheckCircle 
            className={cn(
              "h-5 w-5",
              task.status === "completed" 
                ? "text-green-500" 
                : "text-gray-300 hover:text-green-500"
            )} 
          />
        </button>
        
        <div className="flex-1 min-w-0">
          <div className={cn(
            "font-medium text-sm",
            task.status === "completed" && "line-through text-muted-foreground"
          )}>
            {task.title}
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <Badge className={getPriorityColor(task.priority)} size="sm">
              {task.priority}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {task.estimatedTime}min
            </span>
            {isDueToday && (
              <Badge className="bg-blue-100 text-blue-800" size="sm">Today</Badge>
            )}
            {isOverdue && (
              <Badge className="bg-red-100 text-red-800" size="sm">Overdue</Badge>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
            className="h-8 w-8 p-0"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(
      "hover:shadow-lg transition-shadow",
      task.status === "completed" && "opacity-75",
      isOverdue && "border-red-200"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className={cn(
              "text-lg line-clamp-2",
              task.status === "completed" && "line-through text-muted-foreground"
            )}>
              {task.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
            {task.goalTitle && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Target className="h-3 w-3" />
                <span>{task.goalTitle}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComplete(task._id)}
              disabled={task.status === "completed"}
              className="h-8 w-8 p-0"
            >
              <CheckCircle 
                className={cn(
                  "h-4 w-4",
                  task.status === "completed" 
                    ? "text-green-500" 
                    : "text-gray-300 hover:text-green-500"
                )} 
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="h-8 w-8 p-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge className={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
          <Badge className={getDifficultyColor(task.difficulty)}>
            {task.difficulty}
          </Badge>
          <Badge className={getStatusColor(task.status)}>
            {task.status}
          </Badge>
          {isOverdue && (
            <Badge className="bg-red-100 text-red-800">
              Overdue
            </Badge>
          )}
          {isDueToday && (
            <Badge className="bg-blue-100 text-blue-800">
              Due Today
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Time and Date Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>Est. {task.estimatedTime} min</span>
            {task.actualTime && (
              <span className="text-green-600">
                (Actual: {task.actualTime} min)
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Resources */}
        {task.resources && task.resources.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Resources</div>
            <div className="space-y-1">
              {task.resources.slice(0, 2).map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span className="truncate">{resource.title}</span>
                </a>
              ))}
              {task.resources.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  +{task.resources.length - 2} more resources
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2 pt-2 border-t">
          {task.status !== "completed" && (
            <Button 
              size="sm" 
              onClick={() => onComplete(task._id)}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark Complete
            </Button>
          )}
          {task.status === "pending" && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-1" />
              Start Task
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(task)}
          >
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;