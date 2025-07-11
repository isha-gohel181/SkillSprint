import { useState, useEffect } from "react";
import { quizAPI } from "@/lib/api";
import { toast } from "sonner";

export const useQuiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuizByMilestone = async (milestoneId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await quizAPI.getByMilestone(milestoneId);
      setCurrentQuiz(response.data.quiz);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching quiz:", err);
      // Use mock data for development when backend is not ready
      setCurrentQuiz(mockQuiz);
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async (quizId, answers) => {
    try {
      const response = await quizAPI.submit(quizId, answers);
      toast.success("Quiz submitted successfully!");
      return response.data;
    } catch (err) {
      toast.error("Failed to submit quiz");
      throw err;
    }
  };

  const fetchQuizResults = async (submissionId) => {
    try {
      const response = await quizAPI.getResults(submissionId);
      return response.data;
    } catch (err) {
      console.error("Error fetching quiz results:", err);
      return mockQuizResults;
    }
  };

  const fetchQuizHistory = async () => {
    try {
      const response = await quizAPI.getHistory();
      setQuizHistory(response.data.history || []);
    } catch (err) {
      console.error("Error fetching quiz history:", err);
      setQuizHistory(mockQuizHistory);
    }
  };

  const generateQuiz = (milestone) => {
    // Mock quiz generation based on milestone
    const mockGeneratedQuiz = {
      _id: `quiz_${milestone.id}`,
      milestoneId: milestone.id,
      title: `Quiz: ${milestone.title}`,
      description: `Test your knowledge of ${milestone.title}`,
      questions: [
        {
          id: 1,
          question: `What is the main concept behind ${milestone.title}?`,
          type: "multiple-choice",
          options: [
            "Option A: Basic understanding",
            "Option B: Advanced concept",
            "Option C: Practical application",
            "Option D: All of the above"
          ],
          correctAnswer: 3
        },
        {
          id: 2,
          question: `How would you apply ${milestone.title} in practice?`,
          type: "multiple-choice",
          options: [
            "Through hands-on projects",
            "By reading documentation",
            "Through online courses",
            "All methods are effective"
          ],
          correctAnswer: 3
        },
        {
          id: 3,
          question: `What are the key benefits of mastering ${milestone.title}?`,
          type: "open-ended",
          placeholder: "Describe the main benefits..."
        }
      ],
      timeLimit: 300, // 5 minutes
      passingScore: 70
    };
    
    setCurrentQuiz(mockGeneratedQuiz);
    return mockGeneratedQuiz;
  };

  useEffect(() => {
    fetchQuizHistory();
  }, []);

  return {
    quizzes,
    currentQuiz,
    quizHistory,
    loading,
    error,
    fetchQuizByMilestone,
    submitQuiz,
    fetchQuizResults,
    generateQuiz,
    setCurrentQuiz,
    refetch: fetchQuizHistory
  };
};

// Mock data for development
const mockQuiz = {
  _id: "quiz_1",
  milestoneId: "m1",
  title: "React Fundamentals Quiz",
  description: "Test your understanding of React basics",
  questions: [
    {
      id: 1,
      question: "What is React?",
      type: "multiple-choice",
      options: [
        "A JavaScript library for building user interfaces",
        "A database management system",
        "A server-side programming language",
        "A CSS framework"
      ],
      correctAnswer: 0
    },
    {
      id: 2,
      question: "What is a React component?",
      type: "multiple-choice",
      options: [
        "A reusable piece of UI",
        "A database table",
        "A CSS class",
        "A JavaScript function only"
      ],
      correctAnswer: 0
    },
    {
      id: 3,
      question: "Explain the concept of props in React",
      type: "open-ended",
      placeholder: "Describe what props are and how they work..."
    }
  ],
  timeLimit: 300,
  passingScore: 70
};

const mockQuizResults = {
  score: 85,
  passed: true,
  totalQuestions: 3,
  correctAnswers: 2,
  timeTaken: 240,
  feedback: "Great job! You have a solid understanding of React fundamentals.",
  answers: [
    { questionId: 1, userAnswer: 0, correct: true },
    { questionId: 2, userAnswer: 0, correct: true },
    { questionId: 3, userAnswer: "Props are data passed to components", correct: true }
  ]
};

const mockQuizHistory = [
  {
    _id: "sub_1",
    quizTitle: "React Fundamentals Quiz",
    score: 85,
    passed: true,
    dateTaken: new Date("2024-12-20"),
    timeTaken: 240
  },
  {
    _id: "sub_2", 
    quizTitle: "JavaScript Basics Quiz",
    score: 92,
    passed: true,
    dateTaken: new Date("2024-12-18"),
    timeTaken: 180
  },
  {
    _id: "sub_3",
    quizTitle: "HTML/CSS Quiz",
    score: 78,
    passed: true,
    dateTaken: new Date("2024-12-15"),
    timeTaken: 200
  }
];