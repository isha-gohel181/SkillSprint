import React, { useState } from "react";
import { useQuiz } from "@/hooks/useQuiz";
import { useGoals } from "@/hooks/useGoals";
import QuizCard from "@/components/quiz/QuizCard";
import QuizModal from "@/components/quiz/QuizModal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Target, 
  Trophy, 
  TrendingUp,
  Clock,
  Award,
  Plus,
  CheckCircle
} from "lucide-react";

const QuizPage = () => {
  const { 
    currentQuiz, 
    quizHistory, 
    loading, 
    generateQuiz, 
    submitQuiz, 
    setCurrentQuiz 
  } = useQuiz();
  const { goals } = useGoals();

  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);

  const activeGoals = goals.filter(g => g.status === "active");
  
  // Get available milestones for quizzes
  const availableMilestones = activeGoals.flatMap(goal => 
    goal.milestones.map(milestone => ({
      ...milestone,
      goalId: goal._id,
      goalTitle: goal.title,
      goalCategory: goal.category
    }))
  );

  const handleStartQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setShowQuizModal(true);
  };

  const handleSubmitQuiz = async (quizId, answers) => {
    try {
      const results = await submitQuiz(quizId, answers);
      return results;
    } catch (error) {
      console.error("Error submitting quiz:", error);
      throw error;
    }
  };

  const handleCloseQuiz = () => {
    setShowQuizModal(false);
    setSelectedQuiz(null);
  };

  const handleGenerateQuiz = (milestone) => {
    const quiz = generateQuiz(milestone);
    handleStartQuiz(quiz);
  };

  const getQuizStats = () => {
    const totalQuizzes = quizHistory.length;
    const passedQuizzes = quizHistory.filter(q => q.passed).length;
    const averageScore = totalQuizzes > 0 
      ? Math.round(quizHistory.reduce((sum, q) => sum + q.score, 0) / totalQuizzes)
      : 0;
    const totalTimeSpent = quizHistory.reduce((sum, q) => sum + q.timeTaken, 0);

    return {
      totalQuizzes,
      passedQuizzes,
      averageScore,
      totalTimeSpent: Math.round(totalTimeSpent / 60) // Convert to minutes
    };
  };

  const stats = getQuizStats();

  if (loading) {
    return <LoadingSpinner>Loading quiz data...</LoadingSpinner>;
  }

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Knowledge Assessment</h1>
          <p className="text-muted-foreground">
            Test your understanding and validate your progress with AI-generated quizzes
          </p>
        </div>

        {/* Quiz Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Brain className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Quizzes</p>
                  <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-50">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Passed</p>
                  <p className="text-2xl font-bold">{stats.passedQuizzes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-50">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
                  <p className="text-2xl font-bold">{stats.averageScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-amber-50">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Time Spent</p>
                  <p className="text-2xl font-bold">{stats.totalTimeSpent}m</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Available Milestones for Quizzes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Available Milestone Quizzes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availableMilestones.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-lg font-medium mb-2">No milestones available</p>
                    <p className="text-muted-foreground mb-4">
                      Create a goal with milestones to generate quizzes and test your knowledge
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Goal
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {availableMilestones.slice(0, 6).map((milestone) => (
                      <div 
                        key={`${milestone.goalId}-${milestone.id}`}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium">{milestone.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {milestone.goalTitle} • {milestone.goalCategory}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge 
                              className={milestone.completed 
                                ? "bg-green-100 text-green-800" 
                                : "bg-gray-100 text-gray-800"
                              }
                            >
                              {milestone.completed ? "Completed" : "In Progress"}
                            </Badge>
                          </div>

                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleGenerateQuiz(milestone)}
                          >
                            <Brain className="h-4 w-4 mr-2" />
                            Generate Quiz
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quiz History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Quiz History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {quizHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No quizzes taken yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {quizHistory.slice(0, 10).map((quiz) => (
                      <div 
                        key={quiz._id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            quiz.passed ? "bg-green-100" : "bg-red-100"
                          }`}>
                            {quiz.passed ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{quiz.quizTitle}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(quiz.dateTaken).toLocaleDateString()} • {Math.floor(quiz.timeTaken / 60)}m {quiz.timeTaken % 60}s
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            quiz.score >= 70 ? "text-green-600" : "text-red-600"
                          }`}>
                            {quiz.score}%
                          </div>
                          <Badge 
                            className={quiz.passed 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                            }
                          >
                            {quiz.passed ? "Passed" : "Failed"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Pass Rate</span>
                      <span>{stats.totalQuizzes > 0 ? Math.round((stats.passedQuizzes / stats.totalQuizzes) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ 
                          width: `${stats.totalQuizzes > 0 ? (stats.passedQuizzes / stats.totalQuizzes) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Average Score</span>
                      <span>{stats.averageScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${stats.averageScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {stats.totalQuizzes > 0 && (
                  <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                    {stats.averageScore >= 80 && "🌟 Excellent performance! Keep up the great work!"}
                    {stats.averageScore >= 60 && stats.averageScore < 80 && "👍 Good progress! Focus on weak areas to improve further."}
                    {stats.averageScore < 60 && "📚 Consider reviewing the material before taking more quizzes."}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Learning Tips */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Quiz Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Read questions carefully before answering</p>
                <p>• Take your time - there's no rush</p>
                <p>• Review related materials before quizzes</p>
                <p>• Don't worry about failing - you can retake anytime</p>
                <p>• Use quizzes to identify knowledge gaps</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quiz Modal */}
        {selectedQuiz && (
          <QuizModal
            quiz={selectedQuiz}
            isOpen={showQuizModal}
            onSubmit={handleSubmitQuiz}
            onClose={handleCloseQuiz}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default QuizPage;