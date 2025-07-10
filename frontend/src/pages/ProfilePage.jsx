import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { useTheme } from "@/contexts/ThemeContext";
import { sampleGoals, sampleTasks, sampleAchievements, sampleStreakData } from "@/services/mockData";
import { 
  User, 
  Settings, 
  Trophy, 
  Target, 
  TrendingUp, 
  Bell, 
  Download,
  Mail,
  Shield
} from "lucide-react";

const ProfilePage = () => {
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    weeklyReport: true,
    dailyReminder: false,
    streakReminder: true,
    achievementNotifications: true,
    studyGoalReminder: false,
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        username: userData.username || "",
      });
    }
  }, [userData]);

  const fetchUserData = async () => {
    try {
      const response = await apiClient.get("/users/me");
      setUserData(response.data.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await apiClient.put("/users/me", formData);
      setUserData(response.data.user);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (_error) {
      console.error("Error updating profile:", _error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      // Mock saving preferences
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Success",
        description: "Preferences saved successfully!",
      });
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const exportData = async () => {
    try {
      // Mock data export
      const data = {
        goals: sampleGoals,
        tasks: sampleTasks,
        achievements: sampleAchievements,
        preferences,
        exportedAt: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skillsprint-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Data exported successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  // Calculate statistics
  const completedGoals = sampleGoals.filter(goal => goal.status === 'completed').length;
  const completedTasks = sampleTasks.filter(task => task.status === 'completed').length;
  const earnedAchievements = sampleAchievements.filter(achievement => achievement.earned).length;
  const averageProgress = sampleGoals.reduce((sum, goal) => sum + goal.progress, 0) / sampleGoals.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and learning preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="stats">
            <TrendingUp className="h-4 w-4 mr-2" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Trophy className="h-4 w-4 mr-2" />
            Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details below</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.primaryEmailAddress?.emailAddress || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed here. Use Clerk's user profile to update your email.
                  </p>
                </div>

                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Read-only account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <strong>Account Created:</strong>
                <span>{new Date(user?.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <strong>Last Updated:</strong>
                <span>{new Date(user?.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <strong>Email Verified:</strong>
                <span className="flex items-center">
                  {user?.primaryEmailAddress?.verification?.status === "verified" ? (
                    <>
                      <Shield className="h-4 w-4 text-green-600 mr-1" />
                      Verified
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 text-yellow-600 mr-1" />
                      Pending
                    </>
                  )}
                </span>
              </div>
              {userData && (
                <div className="flex items-center justify-between">
                  <strong>Database Sync:</strong>
                  <span className="text-green-600">Connected</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize your visual experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="theme-toggle">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch
                  id="theme-toggle"
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                { key: 'weeklyReport', label: 'Weekly Progress Report', desc: 'Get weekly summaries of your progress' },
                { key: 'dailyReminder', label: 'Daily Study Reminder', desc: 'Remind me to study daily' },
                { key: 'streakReminder', label: 'Streak Reminders', desc: 'Notify me about maintaining streaks' },
                { key: 'achievementNotifications', label: 'Achievement Alerts', desc: 'Celebrate when you earn badges' },
                { key: 'studyGoalReminder', label: 'Study Goal Reminders', desc: 'Remind me about approaching deadlines' },
              ].map((pref) => (
                <div key={pref.key} className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={pref.key}>{pref.label}</Label>
                    <p className="text-sm text-muted-foreground">{pref.desc}</p>
                  </div>
                  <Switch
                    id={pref.key}
                    checked={preferences[pref.key]}
                    onCheckedChange={(value) => handlePreferenceChange(pref.key, value)}
                  />
                </div>
              ))}
              
              <Button onClick={savePreferences} disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Export and manage your learning data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={exportData} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export My Data
                </Button>
                <p className="text-sm text-muted-foreground">
                  Download all your goals, tasks, achievements, and progress data in JSON format.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Goals Completed</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedGoals}</div>
                <p className="text-xs text-muted-foreground">
                  out of {sampleGoals.length} total goals
                </p>
                <Progress value={(completedGoals / sampleGoals.length) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedTasks}</div>
                <p className="text-xs text-muted-foreground">
                  out of {sampleTasks.length} total tasks
                </p>
                <Progress value={(completedTasks / sampleTasks.length) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sampleStreakData.currentStreak}</div>
                <p className="text-xs text-muted-foreground">
                  Best: {sampleStreakData.longestStreak} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageProgress.toFixed(0)}%</div>
                <p className="text-xs text-muted-foreground">
                  across all goals
                </p>
                <Progress value={averageProgress} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Learning Journey</CardTitle>
              <CardDescription>Your SkillSprint journey timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div>
                    <div className="font-medium">Joined SkillSprint</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(user?.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <div>
                    <div className="font-medium">First Goal Created</div>
                    <div className="text-sm text-muted-foreground">
                      {sampleGoals.length > 0 && new Date(sampleGoals[0].createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {earnedAchievements > 0 && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                    <div>
                      <div className="font-medium">First Achievement Earned</div>
                      <div className="text-sm text-muted-foreground">
                        {sampleAchievements.find(a => a.earned)?.earnedAt && 
                         new Date(sampleAchievements.find(a => a.earned).earnedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Achievements</CardTitle>
              <CardDescription>
                {earnedAchievements} of {sampleAchievements.length} achievements earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={(earnedAchievements / sampleAchievements.length) * 100} className="mb-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sampleAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border ${
                      achievement.earned
                        ? 'bg-primary/10 border-primary/20'
                        : 'bg-muted/50 border-muted'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`text-2xl ${achievement.earned ? '' : 'grayscale opacity-50'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{achievement.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {achievement.description}
                        </div>
                        {achievement.earned && achievement.earnedAt && (
                          <div className="text-xs text-primary mt-1">
                            Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
