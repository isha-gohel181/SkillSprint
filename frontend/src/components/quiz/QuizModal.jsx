import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { 
  Brain, 
  Clock, 
  CheckCircle, 
  X, 
  ArrowRight,
  ArrowLeft,
  Award,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

const QuizModal = ({ 
  quiz, 
  onSubmit, 
  onClose, 
  isOpen = false 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz?.timeLimit || 300);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (!isOpen || !quiz) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, quiz]);

  useEffect(() => {
    if (isOpen) {
      // Reset state when quiz opens
      setCurrentQuestion(0);
      setAnswers({});
      setTimeLeft(quiz?.timeLimit || 300);
      setShowResults(false);
      setResults(null);
    }
  }, [isOpen, quiz]);

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const submissionResults = await onSubmit(quiz._id, answers);
      setResults(submissionResults);
      setShowResults(true);
    } catch (error) {
      console.error("Error submitting quiz:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return ((currentQuestion + 1) / quiz.questions.length) * 100;
  };

  const canSubmit = () => {
    return quiz.questions.every(q => answers[q.id] !== undefined);
  };

  if (!isOpen || !quiz) return null;

  if (showResults && results) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
          <Card className="border-0">
            <CardHeader className="text-center">
              <div className={cn(
                "w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center",
                results.passed ? "bg-green-100" : "bg-red-100"
              )}>
                {results.passed ? (
                  <Award className="h-10 w-10 text-green-600" />
                ) : (
                  <RotateCcw className="h-10 w-10 text-red-600" />
                )}
              </div>
              <CardTitle className={cn(
                "text-2xl",
                results.passed ? "text-green-600" : "text-red-600"
              )}>
                {results.passed ? "Congratulations!" : "Try Again"}
              </CardTitle>
              <p className="text-muted-foreground">
                {results.passed 
                  ? "You've successfully completed the quiz!"
                  : "Don't worry, you can retake the quiz to improve your score."
                }
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {results.score}%
                  </div>
                  <div className="text-sm text-muted-foreground">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {results.correctAnswers}
                  </div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {results.totalQuestions}
                  </div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatTime(results.timeTaken)}
                  </div>
                  <div className="text-sm text-muted-foreground">Time</div>
                </div>
              </div>

              {/* Feedback */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Feedback</h4>
                <p className="text-sm text-muted-foreground">
                  {results.feedback}
                </p>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Button onClick={onClose} className="flex-1">
                  Continue Learning
                </Button>
                {!results.passed && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowResults(false);
                      setCurrentQuestion(0);
                      setAnswers({});
                      setTimeLeft(quiz.timeLimit);
                    }}
                  >
                    Retake Quiz
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <LoadingSpinner>Submitting your answers...</LoadingSpinner>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
        <Card className="border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>{quiz.title}</span>
                </CardTitle>
                <p className="text-muted-foreground">{quiz.description}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className={cn(
                    "h-4 w-4",
                    timeLeft < 60 ? "text-red-500" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    timeLeft < 60 ? "text-red-500 font-medium" : "text-muted-foreground"
                  )}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
                <span>{Math.round(getProgress())}% complete</span>
              </div>
              <Progress value={getProgress()} className="h-2" />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Question */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{question.question}</h3>

              {/* Multiple Choice */}
              {question.type === "multiple-choice" && (
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(question.id, index)}
                      className={cn(
                        "w-full text-left p-4 border rounded-lg transition-colors",
                        answers[question.id] === index
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          answers[question.id] === index
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        )}>
                          {answers[question.id] === index && (
                            <CheckCircle className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <span>{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Open Ended */}
              {question.type === "open-ended" && (
                <textarea
                  value={answers[question.id] || ""}
                  onChange={(e) => handleAnswerSelect(question.id, e.target.value)}
                  placeholder={question.placeholder}
                  className="w-full min-h-[120px] p-4 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                />
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex space-x-2">
                {currentQuestion < quiz.questions.length - 1 ? (
                  <Button
                    onClick={() => setCurrentQuestion(prev => prev + 1)}
                    disabled={answers[question.id] === undefined}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Submit Quiz
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizModal;