const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Google Gemini AI Service for SkillSprint
 * Handles AI-powered features like goal breakdown and quiz generation
 */

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found in environment variables');
      this.genAI = null;
    } else {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  }

  /**
   * Check if Gemini service is available
   * @returns {boolean}
   */
  isAvailable() {
    return this.genAI !== null;
  }

  /**
   * Generate goal breakdown into milestones and tasks
   * @param {Object} goalData - Goal information
   * @returns {Promise<Object>} Generated milestones and tasks
   */
  async generateGoalBreakdown(goalData) {
    if (!this.isAvailable()) {
      throw new Error('Gemini AI service is not available');
    }

    const { title, description, difficulty, timeframe = 30 } = goalData;

    const prompt = `
You are an expert learning coach. Break down the following learning goal into actionable milestones and daily tasks.

Goal: ${title}
Description: ${description}
Difficulty Level: ${difficulty}
Timeframe: ${timeframe} days

Please provide a structured breakdown in the following JSON format:
{
  "milestones": [
    {
      "title": "Milestone 1 title",
      "description": "Detailed description of what will be achieved",
      "estimatedDays": 7,
      "order": 1,
      "tasks": [
        {
          "title": "Task title",
          "description": "What needs to be done",
          "estimatedTime": 60,
          "priority": "medium",
          "resources": [
            {
              "title": "Resource title",
              "url": "https://example.com",
              "type": "article"
            }
          ]
        }
      ]
    }
  ],
  "totalEstimatedDays": 30,
  "recommendedDailyTime": 60
}

Guidelines:
- Create 3-5 milestones that build upon each other
- Each milestone should have 3-7 specific, actionable tasks
- Estimated time should be in minutes (15-120 minutes per task)
- Include diverse resource types: articles, videos, courses, tools
- Use real, helpful resource URLs when possible
- Adjust complexity based on difficulty level
- Tasks should be specific and measurable
`;

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error generating goal breakdown:', error);
      throw new Error('Failed to generate goal breakdown');
    }
  }

  /**
   * Generate quiz questions for a topic
   * @param {Object} quizData - Quiz generation parameters
   * @returns {Promise<Object>} Generated quiz questions
   */
  async generateQuiz(quizData) {
    if (!this.isAvailable()) {
      throw new Error('Gemini AI service is not available');
    }

    const { topic, difficulty, questionCount = 5 } = quizData;

    const prompt = `
Create a ${difficulty}-level quiz about "${topic}" with ${questionCount} questions.

Provide the quiz in the following JSON format:
{
  "title": "Quiz about ${topic}",
  "description": "Test your knowledge of ${topic}",
  "questions": [
    {
      "question": "Question text here?",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of why this is correct"
    },
    {
      "question": "True or false question?",
      "type": "true-false",
      "options": ["True", "False"],
      "correctAnswer": 0,
      "explanation": "Explanation"
    }
  ]
}

Guidelines:
- Include a mix of question types: multiple-choice, true-false
- For multiple choice, provide 4 options with one correct answer
- correctAnswer should be the index (0-based) of the correct option
- Include clear explanations for each answer
- Questions should test understanding, not just memorization
- Adjust difficulty appropriately (${difficulty} level)
- Make questions practical and relevant
`;

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw new Error('Failed to generate quiz');
    }
  }

  /**
   * Generate resource suggestions for a topic
   * @param {string} topic - The topic to find resources for
   * @param {string} difficulty - Difficulty level
   * @returns {Promise<Array>} Array of resource suggestions
   */
  async generateResourceSuggestions(topic, difficulty = 'intermediate') {
    if (!this.isAvailable()) {
      throw new Error('Gemini AI service is not available');
    }

    const prompt = `
Suggest 5-7 learning resources for the topic "${topic}" at ${difficulty} level.

Provide suggestions in this JSON format:
{
  "resources": [
    {
      "title": "Resource title",
      "url": "https://example.com",
      "type": "article",
      "description": "Brief description of what this resource covers"
    }
  ]
}

Guidelines:
- Include diverse resource types: articles, videos, courses, tools, books
- Use real, accessible URLs when possible
- Provide helpful descriptions
- Order by recommended learning sequence
- Focus on high-quality, reputable sources
`;

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.resources || [];
    } catch (error) {
      console.error('Error generating resource suggestions:', error);
      throw new Error('Failed to generate resource suggestions');
    }
  }

  /**
   * Generate motivational content based on progress
   * @param {Object} progressData - User's progress information
   * @returns {Promise<string>} Motivational message
   */
  async generateMotivationalContent(progressData) {
    if (!this.isAvailable()) {
      return "Keep up the great work! Every step forward brings you closer to your goals.";
    }

    const { currentStreak, completedTasks, totalTasks, goalTitle } = progressData;

    const prompt = `
Generate a personalized, motivational message for a user working on their learning goal.

User's Progress:
- Goal: ${goalTitle}
- Current streak: ${currentStreak} days
- Completed tasks: ${completedTasks} out of ${totalTasks}
- Progress percentage: ${Math.round((completedTasks / totalTasks) * 100)}%

Create a short, encouraging message (1-2 sentences) that:
- Acknowledges their current progress
- Provides motivation to continue
- Is positive and energizing
- Relates to their specific goal

Return only the motivational message, no additional formatting.
`;

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating motivational content:', error);
      return "You're making excellent progress! Keep pushing forward and you'll achieve your goals.";
    }
  }
}

module.exports = new GeminiService();