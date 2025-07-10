import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Import components
import Header from "./components/Header";
import { Sidebar, MobileSidebar } from "./components/navigation/Sidebar";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import ProgressPage from "./pages/ProgressPage";
import GoalsPage from "./pages/GoalsPage";
import TasksPage from "./pages/TasksPage";
import QuizPage from "./pages/QuizPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="skillsprint-theme">
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />

            {/* Protected routes with sidebar layout */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="flex h-screen">
                    {/* Desktop Sidebar */}
                    <div className="hidden md:flex">
                      <Sidebar />
                    </div>
                    
                    {/* Main Content */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Mobile Header */}
                      <div className="md:hidden border-b border-border p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-sm">SS</span>
                          </div>
                          <span className="font-bold text-lg">SkillSprint</span>
                        </div>
                        <MobileSidebar />
                      </div>
                      
                      {/* Page Content */}
                      <main className="flex-1 overflow-auto p-6">
                        <Routes>
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/goals" element={<GoalsPage />} />
                          <Route path="/tasks" element={<TasksPage />} />
                          <Route path="/progress" element={<ProgressPage />} />
                          <Route path="/quizzes" element={<QuizPage />} />
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route
                            path="*"
                            element={
                              <div className="text-center">
                                <h1 className="text-2xl font-bold">Page Not Found</h1>
                                <p className="text-muted-foreground">
                                  The page you're looking for doesn't exist.
                                </p>
                              </div>
                            }
                          />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Fallback for signed out users */}
            <Route
              path="*"
              element={
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              }
            />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
