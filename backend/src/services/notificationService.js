// Notification service for future enhancements
// This can be extended to include email notifications, push notifications, etc.

class NotificationService {
  constructor() {
    this.notifications = new Map(); // In-memory storage for now
  }

  // Create notification for user
  async createNotification(userId, type, title, message, data = {}) {
    const notification = {
      id: Date.now().toString(),
      userId,
      type, // 'task_reminder', 'milestone_completed', 'streak_achievement', etc.
      title,
      message,
      data,
      read: false,
      createdAt: new Date(),
    };

    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }

    this.notifications.get(userId).push(notification);

    console.log(`Notification created for user ${userId}: ${title}`);
    return notification;
  }

  // Get notifications for user
  async getUserNotifications(userId, limit = 10) {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  // Mark notification as read
  async markAsRead(userId, notificationId) {
    const userNotifications = this.notifications.get(userId) || [];
    const notification = userNotifications.find((n) => n.id === notificationId);

    if (notification) {
      notification.read = true;
      return notification;
    }

    return null;
  }

  // Send task reminder (placeholder for future implementation)
  async sendTaskReminder(userId, task) {
    return this.createNotification(
      userId,
      "task_reminder",
      "Task Due Soon",
      `Don't forget: "${task.title}" is due today!`,
      { taskId: task._id }
    );
  }

  // Send milestone completion notification
  async sendMilestoneCompleted(userId, goal, milestone) {
    return this.createNotification(
      userId,
      "milestone_completed",
      "Milestone Achieved!",
      `Congratulations! You completed "${milestone}" in "${goal.title}"`,
      { goalId: goal._id, milestone }
    );
  }

  // Send streak achievement notification
  async sendStreakAchievement(userId, streak, goalTitle) {
    return this.createNotification(
      userId,
      "streak_achievement",
      "Streak Achievement!",
      `Amazing! You've maintained a ${streak}-day streak in "${goalTitle}"`,
      { streak, goalTitle }
    );
  }
}

module.exports = new NotificationService();
