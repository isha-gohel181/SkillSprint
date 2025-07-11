import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Clock, 
  Target, 
  Award, 
  Play,
  CheckCircle,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

const QuizCard = ({ 
  quiz, 
  milestone, 
  onStartQuiz, 
  onViewResults,
  lastAttempt = null,
  className 
}) => {
  const hasAttempted = lastAttempt !== null;
  const isPassed = lastAttempt?.passed || false;

  const getDifficultyColor = (numQuestions) => {
    if (numQuestions <= 3) return "bg-green-100 text-green-800";
    if (numQuestions <= 5) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span>{quiz.title}</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {quiz.description}
            </p>
            {milestone && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Target className="h-3 w-3" />
                <span>Milestone: {milestone.title}</span>
              </div>
            )}
          </div>
          
          {isPassed && (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Passed</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Badge className={getDifficultyColor(quiz.questions?.length || 0)}>
            {quiz.questions?.length || 0} Questions
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {Math.floor(quiz.timeLimit / 60)} min
          </Badge>
          <Badge variant="outline" className="text-xs">
            Pass: {quiz.passingScore}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Last Attempt Results */}
        {hasAttempted && (
          <div className={cn(
            "p-3 rounded-lg border",
            isPassed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Last Attempt</div>
                <div className="flex items-center space-x-3 text-sm">
                  <span className={cn("font-medium", getScoreColor(lastAttempt.score))}>
                    Score: {lastAttempt.score}%
                  </span>
                  <span className="text-muted-foreground">
                    Time: {Math.floor(lastAttempt.timeTaken / 60)}m {lastAttempt.timeTaken % 60}s
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">
                  {new Date(lastAttempt.dateTaken).toLocaleDateString()}
                </div>
                {isPassed && (
                  <Award className="h-4 w-4 text-green-500 ml-auto" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quiz Preview */}
        <div className="space-y-2">
          <div className="text-sm font-medium">What you'll learn:</div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Test your understanding of key concepts</li>
            <li>• Identify areas for improvement</li>
            <li>• Validate your progress milestone</li>
            {quiz.questions?.length > 3 && (
              <li>• Advanced topic assessment</li>
            )}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2 border-t">
          {!hasAttempted || !isPassed ? (
            <Button 
              onClick={() => onStartQuiz(quiz)}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              {hasAttempted ? "Retake Quiz" : "Start Quiz"}
            </Button>
          ) : (
            <Button 
              variant="outline"
              onClick={() => onStartQuiz(quiz)}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button>
          )}
          
          {hasAttempted && (
            <Button 
              variant="outline"
              onClick={() => onViewResults(lastAttempt)}
              className="flex-1"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              View Results
            </Button>
          )}
        </div>

        {/* Requirements */}
        {!isPassed && quiz.passingScore && (
          <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
            💡 You need {quiz.passingScore}% or higher to pass this quiz and complete the milestone.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizCard;