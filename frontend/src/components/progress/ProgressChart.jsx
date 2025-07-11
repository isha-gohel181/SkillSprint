import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  Target,
  Clock,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";

const ProgressChart = ({ chartData, timeframe = "week", onTimeframeChange }) => {
  const [selectedMetric, setSelectedMetric] = useState("tasks");

  const timeframes = [
    { value: "week", label: "7 Days" },
    { value: "month", label: "30 Days" },
    { value: "quarter", label: "3 Months" }
  ];

  const metrics = [
    { 
      value: "tasks", 
      label: "Tasks Completed", 
      icon: Target, 
      color: "bg-blue-500",
      data: chartData?.daily?.data || [2, 4, 3, 5, 3, 2, 4]
    },
    { 
      value: "time", 
      label: "Time Spent (hours)", 
      icon: Clock, 
      color: "bg-green-500",
      data: chartData?.daily?.data?.map(d => d * 0.5) || [1, 2, 1.5, 2.5, 1.5, 1, 2]
    },
    { 
      value: "progress", 
      label: "Goal Progress (%)", 
      icon: TrendingUp, 
      color: "bg-purple-500",
      data: chartData?.daily?.data?.map(d => d * 15) || [30, 60, 45, 75, 45, 30, 60]
    }
  ];

  const selectedMetricData = metrics.find(m => m.value === selectedMetric);
  const labels = chartData?.daily?.labels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data = selectedMetricData?.data || [];

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);

  const getBarHeight = (value) => {
    if (maxValue === minValue) return 50;
    return ((value - minValue) / (maxValue - minValue)) * 80 + 20;
  };

  const getTotalValue = () => {
    return data.reduce((sum, value) => sum + value, 0);
  };

  const getAverageValue = () => {
    return data.length > 0 ? (getTotalValue() / data.length).toFixed(1) : 0;
  };

  const getGrowthRate = () => {
    if (data.length < 2) return 0;
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    return firstAvg > 0 ? (((secondAvg - firstAvg) / firstAvg) * 100).toFixed(1) : 0;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Progress Analytics</span>
          </CardTitle>
          <div className="flex space-x-1">
            {timeframes.map((tf) => (
              <Button
                key={tf.value}
                variant={timeframe === tf.value ? "default" : "outline"}
                size="sm"
                onClick={() => onTimeframeChange?.(tf.value)}
              >
                {tf.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Metric Selector */}
        <div className="flex flex-wrap gap-2">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <button
                key={metric.value}
                onClick={() => setSelectedMetric(metric.value)}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors",
                  selectedMetric === metric.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <div className={cn("w-3 h-3 rounded", metric.color)} />
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{metric.label}</span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {selectedMetric === "time" ? getTotalValue().toFixed(1) : getTotalValue()}
            </div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {getAverageValue()}
            </div>
            <div className="text-sm text-muted-foreground">Average</div>
          </div>
          <div className="text-center">
            <div className={cn(
              "text-2xl font-bold",
              parseFloat(getGrowthRate()) >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {getGrowthRate() > 0 ? '+' : ''}{getGrowthRate()}%
            </div>
            <div className="text-sm text-muted-foreground">Growth</div>
          </div>
        </div>

        {/* Chart */}
        <div className="space-y-4">
          <div className="h-64 flex items-end justify-between space-x-2">
            {data.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                <div className="flex-1 flex items-end">
                  <div
                    className={cn(
                      "w-full rounded-t transition-all duration-500 ease-out relative group cursor-pointer",
                      selectedMetricData.color
                    )}
                    style={{ height: `${getBarHeight(value)}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {selectedMetric === "time" ? `${value.toFixed(1)}h` : value}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  {labels[index]}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className={cn("w-3 h-3 rounded", selectedMetricData.color)} />
              <span>{selectedMetricData.label}</span>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2 flex items-center space-x-2">
            <Award className="h-4 w-4 text-yellow-500" />
            <span>Insights</span>
          </h4>
          <div className="text-sm text-muted-foreground space-y-1">
            {parseFloat(getGrowthRate()) > 20 && (
              <p>🚀 Excellent progress! You're showing strong growth this {timeframe}.</p>
            )}
            {parseFloat(getGrowthRate()) < -10 && (
              <p>📈 Consider setting smaller daily goals to maintain consistency.</p>
            )}
            {getTotalValue() === 0 && (
              <p>💡 Start by completing your first task to see your progress here.</p>
            )}
            {selectedMetric === "time" && getTotalValue() > 20 && (
              <p>⏰ Great dedication! You're investing significant time in learning.</p>
            )}
            {selectedMetric === "tasks" && getTotalValue() > 20 && (
              <p>✅ Task completion champion! You're building great momentum.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;