import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { 
  Brain, 
  Target, 
  Calendar, 
  Clock, 
  Sparkles,
  Plus,
  X,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const GoalForm = ({ 
  goal = null, 
  onSave, 
  onCancel, 
  onGenerateBreakdown,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    title: goal?.title || "",
    description: goal?.description || "",
    category: goal?.category || "",
    difficulty: goal?.difficulty || "medium",
    estimatedDuration: goal?.estimatedDuration || "",
    targetDate: goal?.targetDate ? 
      new Date(goal.targetDate).toISOString().split('T')[0] : "",
    milestones: goal?.milestones || []
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [newMilestone, setNewMilestone] = useState("");

  const categories = [
    "Programming", "Design", "Business", "Languages", 
    "Health & Fitness", "Music", "Art", "Science",
    "Communication", "Leadership", "Data Science", "Marketing"
  ];

  const difficulties = [
    { value: "beginner", label: "Beginner", color: "bg-green-100 text-green-800" },
    { value: "intermediate", label: "Intermediate", color: "bg-yellow-100 text-yellow-800" },
    { value: "advanced", label: "Advanced", color: "bg-red-100 text-red-800" }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleGenerateBreakdown = async () => {
    if (!formData.title || !formData.description) {
      alert("Please provide a title and description before generating breakdown");
      return;
    }

    setIsGenerating(true);
    try {
      // Mock AI breakdown generation
      const mockBreakdown = [
        { id: Date.now() + 1, title: "Setup and Environment Preparation", completed: false },
        { id: Date.now() + 2, title: "Learn Fundamentals", completed: false },
        { id: Date.now() + 3, title: "Practical Application", completed: false },
        { id: Date.now() + 4, title: "Advanced Concepts", completed: false },
        { id: Date.now() + 5, title: "Final Project and Assessment", completed: false }
      ];

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setFormData(prev => ({
        ...prev,
        milestones: mockBreakdown
      }));
    } catch (error) {
      console.error("Error generating breakdown:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const addMilestone = () => {
    if (newMilestone.trim()) {
      setFormData(prev => ({
        ...prev,
        milestones: [...prev.milestones, {
          id: Date.now(),
          title: newMilestone.trim(),
          completed: false
        }]
      }));
      setNewMilestone("");
    }
  };

  const removeMilestone = (id) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter(m => m.id !== id)
    }));
  };

  const toggleMilestone = (id) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map(m => 
        m.id === id ? { ...m, completed: !m.completed } : m
      )
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>{goal ? "Edit Goal" : "Create New Goal"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Goal Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                  placeholder="e.g., Learn React Development"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Describe what you want to achieve..."
                  className="w-full min-h-[80px] px-3 py-2 border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                    className="w-full px-3 py-2 border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <div className="flex space-x-2 mt-1">
                    {difficulties.map(diff => (
                      <button
                        key={diff.value}
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, difficulty: diff.value}))}
                        className={cn(
                          "px-3 py-1 rounded text-xs font-medium transition-colors",
                          formData.difficulty === diff.value 
                            ? diff.color 
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {diff.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Estimated Duration</Label>
                  <Input
                    id="duration"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData(prev => ({...prev, estimatedDuration: e.target.value}))}
                    placeholder="e.g., 3 months"
                  />
                </div>

                <div>
                  <Label htmlFor="targetDate">Target Date</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData(prev => ({...prev, targetDate: e.target.value}))}
                  />
                </div>
              </div>
            </div>

            {/* AI Breakdown Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <Label className="text-base font-medium">Goal Breakdown</Label>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateBreakdown}
                  disabled={isGenerating || !formData.title || !formData.description}
                  className="flex items-center space-x-1"
                >
                  {isGenerating ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>{isGenerating ? "Generating..." : "AI Generate"}</span>
                </Button>
              </div>

              {/* Milestones List */}
              <div className="space-y-2 mb-4">
                {formData.milestones.map((milestone) => (
                  <div 
                    key={milestone.id} 
                    className="flex items-center space-x-2 p-2 border rounded-md group hover:bg-gray-50"
                  >
                    <button
                      type="button"
                      onClick={() => toggleMilestone(milestone.id)}
                    >
                      <CheckCircle 
                        className={cn(
                          "h-4 w-4",
                          milestone.completed 
                            ? "text-green-500" 
                            : "text-gray-300"
                        )} 
                      />
                    </button>
                    <span className={cn(
                      "flex-1 text-sm",
                      milestone.completed 
                        ? "line-through text-muted-foreground" 
                        : ""
                    )}>
                      {milestone.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeMilestone(milestone.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Milestone */}
              <div className="flex space-x-2">
                <Input
                  value={newMilestone}
                  onChange={(e) => setNewMilestone(e.target.value)}
                  placeholder="Add a milestone..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMilestone}
                  disabled={!newMilestone.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-3 pt-6 border-t">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <span>{goal ? "Update Goal" : "Create Goal"}</span>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalForm;