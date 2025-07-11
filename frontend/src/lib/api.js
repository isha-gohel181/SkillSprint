import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get the session token from Clerk
      const token = await window.Clerk?.session?.getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting auth token:", error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to sign in
      console.error("Unauthorized access - redirecting to sign in");
      window.location.href = "/sign-in";
    }

    return Promise.reject(error);
  }
);

// Goals API
export const goalsAPI = {
  getAll: () => apiClient.get("/goals"),
  getById: (id) => apiClient.get(`/goals/${id}`),
  create: (goalData) => apiClient.post("/goals", goalData),
  update: (id, goalData) => apiClient.put(`/goals/${id}`, goalData),
  delete: (id) => apiClient.delete(`/goals/${id}`),
  generateBreakdown: (goalData) => apiClient.post("/goals/breakdown", goalData),
};

// Tasks API
export const tasksAPI = {
  getAll: (filters = {}) => apiClient.get("/tasks", { params: filters }),
  getById: (id) => apiClient.get(`/tasks/${id}`),
  create: (taskData) => apiClient.post("/tasks", taskData),
  update: (id, taskData) => apiClient.put(`/tasks/${id}`, taskData),
  delete: (id) => apiClient.delete(`/tasks/${id}`),
  markComplete: (id) => apiClient.patch(`/tasks/${id}/complete`),
  getByGoal: (goalId) => apiClient.get(`/goals/${goalId}/tasks`),
};

// Progress API
export const progressAPI = {
  getOverview: () => apiClient.get("/progress/overview"),
  getStats: (timeframe = "week") => apiClient.get(`/progress/stats?timeframe=${timeframe}`),
  getStreaks: () => apiClient.get("/progress/streaks"),
  logActivity: (activityData) => apiClient.post("/progress/activity", activityData),
  getChartData: (type, timeframe) => apiClient.get(`/progress/charts/${type}?timeframe=${timeframe}`),
};

// Quiz API
export const quizAPI = {
  getByMilestone: (milestoneId) => apiClient.get(`/quizzes/milestone/${milestoneId}`),
  submit: (quizId, answers) => apiClient.post(`/quizzes/${quizId}/submit`, { answers }),
  getResults: (submissionId) => apiClient.get(`/quizzes/results/${submissionId}`),
  getHistory: () => apiClient.get("/quizzes/history"),
};

// AI API
export const aiAPI = {
  generateGoalBreakdown: (goalDescription) => 
    apiClient.post("/ai/goal-breakdown", { description: goalDescription }),
  generateQuiz: (milestoneId) => 
    apiClient.post("/ai/generate-quiz", { milestoneId }),
  getMotivationalQuote: () => apiClient.get("/ai/quote"),
  suggestResources: (skillId) => 
    apiClient.post("/ai/resources", { skillId }),
};

export { apiClient };
