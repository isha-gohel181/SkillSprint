import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Flame, Target, Clock } from "lucide-react";

const ProgressStats = ({ overview }) => {
  if (!overview) return null;

  const stats = [
    {
      title: "Active Goals",
      value: overview.activeGoals,
      total: overview.totalGoals,
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+2 this month"
    },
    {
      title: "Tasks Completed",
      value: overview.completedTasks,
      total: overview.totalTasks,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: `${Math.round(overview.completionRate)}% completion rate`
    },
    {
      title: "Current Streak",
      value: overview.currentStreak,
      icon: Flame,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: `Best: ${overview.longestStreak} days`,
      suffix: "days"
    },
    {
      title: "Time Spent",
      value: Math.round(overview.totalTimeSpent / 60),
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: `Avg: ${overview.averageDaily}min/day`,
      suffix: "hours"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline space-x-1">
                    <p className="text-2xl font-bold">
                      {stat.value}
                    </p>
                    {stat.suffix && (
                      <span className="text-sm text-muted-foreground">
                        {stat.suffix}
                      </span>
                    )}
                    {stat.total && (
                      <span className="text-sm text-muted-foreground">
                        /{stat.total}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.change}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProgressStats;