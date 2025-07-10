// Mock data for SkillSprint features
import { addDays, subDays, format } from 'date-fns';

// Generate sample data for the last 30 days
const generateProgressData = () => {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      completedTasks: Math.floor(Math.random() * 10) + 1,
      studyHours: Math.floor(Math.random() * 8) + 1,
      score: Math.floor(Math.random() * 30) + 70,
    });
  }
  return data;
};

// Sample goals data
export const sampleGoals = [
  {
    id: '1',
    title: 'Learn React.js',
    description: 'Master React.js fundamentals and advanced concepts',
    category: 'Web Development',
    status: 'active',
    progress: 75,
    targetDate: addDays(new Date(), 30),
    createdAt: subDays(new Date(), 10),
    tasks: ['1', '2', '3'],
  },
  {
    id: '2',
    title: 'Master TypeScript',
    description: 'Learn TypeScript for better code quality',
    category: 'Programming',
    status: 'active',
    progress: 45,
    targetDate: addDays(new Date(), 45),
    createdAt: subDays(new Date(), 5),
    tasks: ['4', '5'],
  },
  {
    id: '3',
    title: 'Data Structures & Algorithms',
    description: 'Study fundamental CS concepts',
    category: 'Computer Science',
    status: 'completed',
    progress: 100,
    targetDate: subDays(new Date(), 5),
    createdAt: subDays(new Date(), 60),
    tasks: ['6', '7', '8', '9'],
  },
];

// Sample tasks data
export const sampleTasks = [
  {
    id: '1',
    title: 'Complete React Hooks tutorial',
    description: 'Learn useState, useEffect, and custom hooks',
    goalId: '1',
    status: 'completed',
    priority: 'high',
    dueDate: subDays(new Date(), 2),
    completedAt: subDays(new Date(), 1),
  },
  {
    id: '2',
    title: 'Build a todo app with React',
    description: 'Practice React skills by building a practical application',
    goalId: '1',
    status: 'in-progress',
    priority: 'medium',
    dueDate: addDays(new Date(), 5),
  },
  {
    id: '3',
    title: 'Learn React Router',
    description: 'Understand client-side routing in React applications',
    goalId: '1',
    status: 'pending',
    priority: 'medium',
    dueDate: addDays(new Date(), 10),
  },
  {
    id: '4',
    title: 'TypeScript basics',
    description: 'Learn basic TypeScript syntax and concepts',
    goalId: '2',
    status: 'completed',
    priority: 'high',
    dueDate: subDays(new Date(), 1),
    completedAt: new Date(),
  },
  {
    id: '5',
    title: 'Advanced TypeScript features',
    description: 'Learn generics, decorators, and advanced types',
    goalId: '2',
    status: 'in-progress',
    priority: 'high',
    dueDate: addDays(new Date(), 7),
  },
];

// Sample quiz data
export const sampleQuizzes = [
  {
    id: '1',
    title: 'React Fundamentals Quiz',
    description: 'Test your knowledge of React basics',
    category: 'Web Development',
    questions: [
      {
        id: '1',
        question: 'What is a React component?',
        type: 'multiple-choice',
        options: [
          'A function that returns JSX',
          'A class that extends React.Component',
          'Both A and B',
          'None of the above'
        ],
        correctAnswer: 2,
        explanation: 'React components can be either functions that return JSX or classes that extend React.Component.'
      },
      {
        id: '2',
        question: 'React uses a virtual DOM for better performance.',
        type: 'true-false',
        correctAnswer: true,
        explanation: 'React uses a virtual DOM to efficiently update the actual DOM by comparing changes.'
      },
    ],
    totalQuestions: 2,
    timeLimit: 10, // minutes
    attempts: [
      {
        id: '1',
        score: 85,
        completedAt: subDays(new Date(), 3),
        answers: [2, true],
      }
    ],
  },
  {
    id: '2',
    title: 'TypeScript Basics Quiz',
    description: 'Test your TypeScript knowledge',
    category: 'Programming',
    questions: [
      {
        id: '1',
        question: 'What is TypeScript?',
        type: 'multiple-choice',
        options: [
          'A JavaScript framework',
          'A superset of JavaScript',
          'A CSS preprocessor',
          'A database'
        ],
        correctAnswer: 1,
        explanation: 'TypeScript is a superset of JavaScript that adds static type definitions.'
      },
    ],
    totalQuestions: 1,
    timeLimit: 5,
    attempts: [],
  },
];

// Sample progress data
export const sampleProgressData = generateProgressData();

// Sample streak data
export const sampleStreakData = {
  currentStreak: 7,
  longestStreak: 15,
  totalDays: 45,
};

// Sample achievements
export const sampleAchievements = [
  {
    id: '1',
    title: 'First Goal',
    description: 'Complete your first goal',
    icon: '🎯',
    earned: true,
    earnedAt: subDays(new Date(), 30),
  },
  {
    id: '2',
    title: '7 Day Streak',
    description: 'Maintain a 7-day learning streak',
    icon: '🔥',
    earned: true,
    earnedAt: new Date(),
  },
  {
    id: '3',
    title: 'Quiz Master',
    description: 'Score 90% or higher on 5 quizzes',
    icon: '🏆',
    earned: false,
  },
  {
    id: '4',
    title: 'Task Crusher',
    description: 'Complete 50 tasks',
    icon: '⚡',
    earned: false,
  },
];