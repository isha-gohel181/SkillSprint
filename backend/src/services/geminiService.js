const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async breakdownGoal(goalTitle, description, duration, difficulty) {
    try {
      const prompt = `
        As an AI learning coach, break down this learning goal into structured milestones and daily tasks.
        
        Goal: ${goalTitle}
        Description: ${description}
        Duration: ${duration} days
        Difficulty: ${difficulty}
        
        Please provide a JSON response with the following structure:
        {
          "milestones": [
            {
              "title": "Milestone title",
              "description": "Detailed description of what to achieve"
            }
          ],
          "tasks": [
            {
              "title": "Task title",
              "description": "Task description",
              "type": "Reading|Video|Practice|Quiz|Project",
              "estimatedTime": 30,
              "difficulty": "Easy|Medium|Hard",
              "resources": [
                {
                  "type": "article|video|book",
                  "title": "Resource title",
                  "url": "https://example.com",
                  "description": "Resource description"
                }
              ]
            }
          ]
        }
        
        Make sure to:
        1. Create 3-5 meaningful milestones that build upon each other
        2. Generate ${Math.ceil(
          duration * 0.8
        )} tasks spread across the duration
        3. Include varied task types (reading, videos, practice, quizzes)
        4. Provide realistic time estimates
        5. Include relevant learning resources with actual URLs when possible
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error("Failed to parse AI response");
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  async generateQuiz(milestone, goalContext) {
    try {
      const prompt = `
        Create a quiz to assess completion of this learning milestone:
        
        Milestone: ${milestone}
        Goal Context: ${goalContext}
        
        Generate a JSON response with this structure:
        {
          "questions": [
            {
              "question": "Question text",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctAnswer": "Option A",
              "explanation": "Why this is correct"
            }
          ]
        }
        
        Requirements:
        1. Create 5-7 multiple choice questions
        2. Questions should test understanding, not just memorization
        3. Include practical application questions
        4. Provide clear explanations for correct answers
        5. Make sure options are plausible but clearly distinguishable
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error("Failed to parse quiz response");
    } catch (error) {
      console.error("Gemini Quiz Error:", error);
      throw error;
    }
  }

  async suggestResources(topic, difficulty) {
    try {
      const prompt = `
        Suggest learning resources for: ${topic}
        Difficulty level: ${difficulty}
        
        Provide a JSON response with this structure:
        {
          "resources": [
            {
              "type": "article|video|book|course",
              "title": "Resource title",
              "url": "https://example.com",
              "description": "Brief description",
              "estimatedTime": 30
            }
          ]
        }
        
        Include 5-8 high-quality, diverse resources with real URLs when possible.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return { resources: [] };
    } catch (error) {
      console.error("Gemini Resources Error:", error);
      return { resources: [] };
    }
  }

  async getMotivationalQuote(goalType) {
    try {
      const prompt = `
        Generate a motivational quote related to learning ${goalType}.
        Return just the quote text, no additional formatting.
        Make it inspiring and relevant to skill development.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error("Gemini Quote Error:", error);
      return "Every expert was once a beginner. Keep learning!";
    }
  }
}

module.exports = new GeminiService();
