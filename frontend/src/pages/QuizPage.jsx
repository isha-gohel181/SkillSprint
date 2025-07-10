import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sampleQuizzes } from '@/services/mockData';
import QuizModal from '@/components/quiz/QuizModal';
import { Play, Trophy, Clock, BarChart3, Brain } from 'lucide-react';

const QuizCard = ({ quiz, onStartQuiz }) => {
  const lastAttempt = quiz.attempts?.length > 0 ? quiz.attempts[quiz.attempts.length - 1] : null;
  const bestScore = quiz.attempts?.length > 0 ? Math.max(...quiz.attempts.map(a => a.score)) : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{quiz.title}</CardTitle>
            <CardDescription className="mt-1">
              {quiz.description}
            </CardDescription>
          </div>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            {quiz.category}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-1">
            <Brain className="h-4 w-4 text-muted-foreground" />
            <span>{quiz.totalQuestions} questions</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{quiz.timeLimit} min</span>
          </div>
        </div>

        {lastAttempt && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Last Score:</span>
              <span className="text-sm font-bold">{lastAttempt.score}%</span>
            </div>
            {bestScore && bestScore !== lastAttempt.score && (
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-muted-foreground">Best Score:</span>
                <span className="text-sm font-medium text-green-600">{bestScore}%</span>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-1" />
            View Stats
          </Button>
          <Button size="sm" onClick={() => onStartQuiz(quiz)}>
            <Play className="h-4 w-4 mr-1" />
            {lastAttempt ? 'Retake' : 'Start'} Quiz
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const QuizPage = () => {
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  const handleStartQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setIsQuizModalOpen(true);
  };

  const handleQuizComplete = (result) => {
    console.log('Quiz completed:', result);
    // Here you would typically save the result to your backend
  };

  const totalQuizzes = sampleQuizzes.length;
  const attemptedQuizzes = sampleQuizzes.filter(quiz => quiz.attempts.length > 0).length;
  const avgScore = sampleQuizzes
    .filter(quiz => quiz.attempts.length > 0)
    .reduce((sum, quiz) => {
      const bestScore = Math.max(...quiz.attempts.map(a => a.score));
      return sum + bestScore;
    }, 0) / (attemptedQuizzes || 1);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quizzes</h1>
          <p className="text-muted-foreground">
            Test your knowledge and track your progress
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuizzes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attempted</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attemptedQuizzes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore.toFixed(0)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Available Quizzes */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Available Quizzes</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sampleQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onStartQuiz={handleStartQuiz}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        <Card>
          <CardContent className="pt-6">
            {sampleQuizzes
              .filter(quiz => quiz.attempts.length > 0)
              .flatMap(quiz =>
                quiz.attempts.map(attempt => ({
                  ...attempt,
                  quizTitle: quiz.title,
                  quizId: quiz.id,
                }))
              )
              .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
              .slice(0, 5)
              .map((attempt, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <div className="font-medium">{attempt.quizTitle}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(attempt.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{attempt.score}%</div>
                    <div className="text-sm text-muted-foreground">
                      {attempt.score >= 80 ? 'Excellent' : attempt.score >= 60 ? 'Good' : 'Needs improvement'}
                    </div>
                  </div>
                </div>
              ))}
            {sampleQuizzes.every(quiz => quiz.attempts.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No quiz attempts yet. Start taking quizzes to see your activity here!
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quiz Modal */}
      <QuizModal
        quiz={selectedQuiz}
        isOpen={isQuizModalOpen}
        onClose={() => {
          setIsQuizModalOpen(false);
          setSelectedQuiz(null);
        }}
        onComplete={handleQuizComplete}
      />
    </div>
  );
};

export default QuizPage;