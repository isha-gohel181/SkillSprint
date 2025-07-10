# SkillSprint Backend API Documentation

## Overview
Comprehensive backend API for SkillSprint - an AI-powered skill building and goal tracking platform built on MERN stack with Clerk authentication.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All API endpoints (except health check) require authentication via Clerk. Include the authentication token in the Authorization header:
```
Authorization: Bearer <clerk_token>
```

## Response Format
All responses follow this standardized format:

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Endpoints

### Health Check
- **GET** `/health` - Check server status (no authentication required)

### Goals API (`/goals`)
- **GET** `/goals` - Get all goals for user (with pagination and filtering)
- **GET** `/goals/:id` - Get specific goal by ID
- **POST** `/goals` - Create a new goal
- **POST** `/goals/ai` - Create goal with AI-generated breakdown
- **PUT** `/goals/:id` - Update a goal
- **DELETE** `/goals/:id` - Delete a goal (soft delete)
- **POST** `/goals/:goalId/milestones/:milestoneId/complete` - Complete a milestone
- **GET** `/goals/:id/analytics` - Get goal analytics

### Tasks API (`/tasks`)
- **GET** `/tasks` - Get all tasks for user (with filtering)
- **GET** `/tasks/daily` - Get daily tasks (due today or scheduled)
- **GET** `/tasks/overdue` - Get overdue tasks
- **GET** `/tasks/priority/:priority` - Get tasks by priority level
- **GET** `/tasks/:id` - Get specific task by ID
- **POST** `/tasks` - Create a new task
- **PUT** `/tasks/:id` - Update a task
- **POST** `/tasks/:id/complete` - Complete a task
- **POST** `/tasks/:id/schedule` - Schedule a task for specific date
- **DELETE** `/tasks/:id` - Delete a task (soft delete)

### Progress API (`/progress`)
- **POST** `/progress` - Log progress for a goal/task
- **GET** `/progress` - Get all progress entries (with filtering)
- **GET** `/progress/daily` - Get daily progress summary
- **GET** `/progress/weekly` - Get weekly progress breakdown
- **GET** `/progress/monthly` - Get monthly progress analysis
- **GET** `/progress/streak` - Get user's learning streak data
- **GET** `/progress/analytics` - Get comprehensive progress analytics
- **PUT** `/progress/:id` - Update progress entry
- **DELETE** `/progress/:id` - Delete progress entry (soft delete)

### AI API (`/ai`)
- **GET** `/ai/status` - Get AI service availability status
- **POST** `/ai/goal-breakdown` - Generate goal breakdown using AI
- **POST** `/ai/quiz` - Generate quiz using AI
- **POST** `/ai/resources` - Generate resource suggestions
- **POST** `/ai/motivation` - Generate motivational content
- **POST** `/ai/enhance-goal/:goalId` - Enhance existing goal with AI
- **POST** `/ai/study-plan` - Generate personalized study plan

### Quizzes API (`/quizzes`)
- **GET** `/quizzes` - Get all quizzes for user
- **GET** `/quizzes/:id` - Get specific quiz (without answers)
- **POST** `/quizzes` - Create a new quiz
- **PUT** `/quizzes/:id` - Update a quiz
- **DELETE** `/quizzes/:id` - Delete a quiz (soft delete)
- **POST** `/quizzes/:id/start` - Start a quiz attempt
- **POST** `/quizzes/:id/submit` - Submit quiz answers
- **GET** `/quizzes/:id/attempts` - Get user's quiz attempts
- **GET** `/quizzes/:id/results/:attemptId` - Get detailed quiz results

## Data Models

### Goal
```json
{
  "title": "Learn React Development",
  "description": "Master React from basics to advanced concepts",
  "category": "programming",
  "difficulty": "intermediate",
  "status": "active",
  "milestones": [
    {
      "title": "Learn React Basics",
      "description": "Components, JSX, Props, State",
      "order": 1,
      "estimatedDays": 7,
      "isCompleted": false
    }
  ],
  "targetDate": "2024-12-31T00:00:00.000Z",
  "progress": 25,
  "tags": ["frontend", "javascript"]
}
```

### Task
```json
{
  "title": "Complete React Tutorial",
  "description": "Work through official React tutorial",
  "goalId": "goal_object_id",
  "priority": "high",
  "status": "pending",
  "estimatedTime": 120,
  "dueDate": "2024-07-15T00:00:00.000Z",
  "resources": [
    {
      "title": "React Official Tutorial",
      "url": "https://react.dev/tutorial",
      "type": "article"
    }
  ]
}
```

### Progress
```json
{
  "goalId": "goal_object_id",
  "taskId": "task_object_id",
  "timeSpent": 60,
  "description": "Completed React basics tutorial",
  "type": "study",
  "mood": "good",
  "rating": 4,
  "achievements": ["Learned JSX syntax"],
  "challenges": ["Understanding state management"]
}
```

### Quiz
```json
{
  "title": "React Basics Quiz",
  "description": "Test your React fundamentals",
  "goalId": "goal_object_id",
  "difficulty": "intermediate",
  "timeLimit": 30,
  "questions": [
    {
      "question": "What is JSX?",
      "type": "multiple-choice",
      "options": ["A syntax extension", "A library", "A framework", "A tool"],
      "correctAnswer": 0,
      "explanation": "JSX is a syntax extension for JavaScript"
    }
  ]
}
```

## Environment Variables

Create a `.env` file in the backend directory with:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/skillsprint-app

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret_here

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Server
PORT=5000
NODE_ENV=development
```

## Features

### 🤖 AI-Powered Features
- **Goal Breakdown**: Automatically decompose learning goals into actionable milestones and tasks
- **Quiz Generation**: Create assessments based on learning topics and difficulty levels
- **Resource Suggestions**: Get curated learning resources for any topic
- **Motivational Content**: Personalized encouragement based on progress
- **Study Plans**: AI-generated schedules based on available time and goals

### 📊 Analytics & Tracking
- **Progress Tracking**: Log daily learning activities with detailed metrics
- **Streak Monitoring**: Track consecutive learning days
- **Performance Analytics**: Comprehensive insights into learning patterns
- **Goal Analytics**: Progress visualization and completion estimates

### 🎯 Goal Management
- **Milestone System**: Break down goals into manageable milestones
- **Progress Calculation**: Automatic progress updates based on completed tasks
- **Categorization**: Organize goals by learning categories
- **Difficulty Levels**: Adjust content complexity based on skill level

### 📋 Task Management
- **Smart Scheduling**: AI-suggested task scheduling
- **Priority Management**: Organize tasks by importance and urgency
- **Resource Integration**: Attach learning materials to specific tasks
- **Time Tracking**: Monitor time spent on each task

### 🧪 Assessment System
- **Multiple Question Types**: Support for various quiz formats
- **Attempt Tracking**: Monitor quiz performance over time
- **Detailed Feedback**: Explanations for correct and incorrect answers
- **Progress Integration**: Link assessments to learning milestones

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (copy from `.env.example`)
4. Start the server: `npm run dev`
5. Server will run on `http://localhost:5000`

## Security Features

- **Authentication**: All routes protected with Clerk authentication
- **User Isolation**: Data access restricted to authenticated users only
- **Input Validation**: Comprehensive request validation using Joi
- **Soft Deletes**: Data preservation with logical deletion
- **Error Handling**: Secure error responses without sensitive data exposure

## Database Indexes

Optimized for performance with strategic indexing:
- User-based queries (userId indexing)
- Date-based filtering (createdAt, dueDate, scheduledFor)
- Goal and task relationships
- Progress tracking queries

The backend is now ready for frontend integration with a complete set of APIs for building a comprehensive skill learning platform!