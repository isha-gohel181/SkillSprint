import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const StreakCounter = ({ streaks }) => {
  if (!streaks) return null;

  // Generate last 7 days for streak visualization
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const isActiveDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return streaks.history?.some(h => 
      h.date.startsWith(dateStr) && h.active
    ) || false;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <span>Daily Streak</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Streak Display */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Flame className="h-8 w-8 text-orange-500" />
            <div>
              <div className="text-3xl font-bold text-orange-600">
                {streaks.current}
              </div>
              <div className="text-sm text-muted-foreground">
                Day{streaks.current !== 1 ? 's' : ''} in a row
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Best streak: {streaks.longest} days
          </div>
        </div>

        {/* Last 7 Days Visualization */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Last 7 Days</div>
          <div className="flex justify-between">
            {last7Days.map((date, index) => {
              const isActive = isActiveDay(date);
              const isToday = date.toDateString() === today.toDateString();
              
              return (
                <div key={index} className="flex flex-col items-center space-y-1">
                  <div className="text-xs text-muted-foreground">
                    {date.toLocaleDateString('en', { weekday: 'short' })}
                  </div>
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors",
                      isActive
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-gray-100 text-gray-400 border-gray-200",
                      isToday && "ring-2 ring-orange-200"
                    )}
                  >
                    {isActive ? (
                      <Flame className="h-4 w-4" />
                    ) : (
                      <Calendar className="h-3 w-3" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Streak Motivation */}
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-sm font-medium text-orange-800">
            {streaks.current === 0 
              ? "Start your streak today! 🚀"
              : streaks.current < 7
              ? "Keep it up! You're building momentum 💪"
              : streaks.current < 30
              ? "Amazing consistency! You're on fire 🔥"
              : "Incredible dedication! You're a learning machine 🏆"
            }
          </div>
        </div>

        {/* Tips */}
        {streaks.current === 0 && (
          <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
            💡 Tip: Complete any task or spend 15 minutes learning to start your streak!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StreakCounter;