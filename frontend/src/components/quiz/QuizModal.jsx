import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, ArrowRight, ArrowLeft } from 'lucide-react';

const QuizModal = ({ quiz, isOpen, onClose, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  // Initialize timer when quiz starts
  useEffect(() => {
    if (isOpen && quiz && quiz.timeLimit) {
      setTimeLeft(quiz.timeLimit * 60); // Convert minutes to seconds
    }
  }, [isOpen, quiz]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    let correctAnswers = 0;
    quiz.questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100);
    setScore(finalScore);
    setIsSubmitted(true);

    // Call onComplete callback if provided
    if (onComplete) {
      onComplete({
        score: finalScore,
        answers,
        completedAt: new Date(),
      });
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeLeft(quiz?.timeLimit ? quiz.timeLimit * 60 : null);
    setIsSubmitted(false);
    setScore(null);
  };

  const handleClose = () => {
    resetQuiz();
    onClose();
  };

  if (!quiz) return null;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const canProceed = answers[currentQuestion?.id] !== undefined;

  // Results view
  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quiz Results</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{score}%</div>
              <div className="text-muted-foreground">
                {score >= 80 ? 'Excellent!' : score >= 60 ? 'Good job!' : 'Keep practicing!'}
              </div>
            </div>

            <div className="space-y-4">
              {quiz.questions.map((question, index) => {
                const userAnswer = answers[question.id];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <Card key={question.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start space-x-3">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{question.question}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {question.explanation}
                          </div>
                          <div className="mt-2 text-sm">
                            <span className="font-medium">Your answer: </span>
                            <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                              {question.type === 'multiple-choice' 
                                ? question.options[userAnswer] 
                                : userAnswer?.toString()
                              }
                            </span>
                          </div>
                          {!isCorrect && (
                            <div className="mt-1 text-sm">
                              <span className="font-medium">Correct answer: </span>
                              <span className="text-green-600">
                                {question.type === 'multiple-choice' 
                                  ? question.options[question.correctAnswer] 
                                  : question.correctAnswer.toString()
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-center space-x-3">
              <Button variant="outline" onClick={resetQuiz}>
                Retake Quiz
              </Button>
              <Button onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{quiz.title}</DialogTitle>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            {timeLeft !== null && (
              <div className="flex items-center space-x-1 text-sm">
                <Clock className="h-4 w-4" />
                <span className={timeLeft < 60 ? 'text-red-600' : ''}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <Progress value={progress} />

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">
                {currentQuestion.question}
              </h3>

              {currentQuestion.type === 'multiple-choice' && (
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <label
                      key={index}
                      className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-accent"
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={index}
                        checked={answers[currentQuestion.id] === index}
                        onChange={() => handleAnswerSelect(currentQuestion.id, index)}
                        className="h-4 w-4"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'true-false' && (
                <div className="space-y-2">
                  {[true, false].map((option) => (
                    <label
                      key={option.toString()}
                      className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-accent"
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={option}
                        checked={answers[currentQuestion.id] === option}
                        onChange={() => handleAnswerSelect(currentQuestion.id, option)}
                        className="h-4 w-4"
                      />
                      <span>{option ? 'True' : 'False'}</span>
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="space-x-2">
              {isLastQuestion ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed}
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuizModal;