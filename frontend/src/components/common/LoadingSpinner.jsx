import React from "react";
import { cn } from "@/lib/utils";

const LoadingSpinner = ({ 
  size = "default", 
  className,
  children 
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  return (
    <div className={cn("flex items-center justify-center p-4", className)}>
      <div className="flex flex-col items-center space-y-2">
        <div 
          className={cn(
            "animate-spin rounded-full border-2 border-gray-300 border-t-primary",
            sizeClasses[size]
          )}
        />
        {children && (
          <p className="text-sm text-muted-foreground">{children}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;