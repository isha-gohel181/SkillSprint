import React, { useState } from "react";
import { useGoals } from "@/hooks/useGoals";
import GoalsList from "@/components/goals/GoalsList";
import GoalForm from "@/components/goals/GoalForm";
import ErrorBoundary from "@/components/common/ErrorBoundary";

const GoalsPage = () => {
  const { goals, loading, createGoal, updateGoal, deleteGoal } = useGoals();
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const handleCreateNew = () => {
    setEditingGoal(null);
    setShowForm(true);
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleSave = async (goalData) => {
    try {
      if (editingGoal) {
        await updateGoal(editingGoal._id, goalData);
      } else {
        await createGoal(goalData);
      }
      setShowForm(false);
      setEditingGoal(null);
    } catch (error) {
      console.error("Error saving goal:", error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingGoal(null);
  };

  const handleDelete = async (goalId) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        await deleteGoal(goalId);
      } catch (error) {
        console.error("Error deleting goal:", error);
      }
    }
  };

  const handleToggleStatus = async (goalId) => {
    const goal = goals.find(g => g._id === goalId);
    if (goal) {
      const newStatus = goal.status === "active" ? "paused" : "active";
      try {
        await updateGoal(goalId, { ...goal, status: newStatus });
      } catch (error) {
        console.error("Error updating goal status:", error);
      }
    }
  };

  if (showForm) {
    return (
      <ErrorBoundary>
        <GoalForm
          goal={editingGoal}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={loading}
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <GoalsList
        goals={goals}
        loading={loading}
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />
    </ErrorBoundary>
  );
};

export default GoalsPage;