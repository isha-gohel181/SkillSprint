import React from "react";
import { Link } from "react-router-dom";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Target, TrendingUp, Brain, BookOpen, Trophy, Zap } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl">
            <Target className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          SkillSprint AI
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your AI-powered learning companion for building skills, tracking progress, 
          and achieving your professional development goals
        </p>

        <SignedOut>
          <div className="space-y-4">
            <p className="text-lg">Start your learning journey today</p>
            <SignUpButton mode="modal">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Get Started Free
              </Button>
            </SignUpButton>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="space-y-4">
            <p className="text-lg">Welcome back! Continue your learning journey</p>
            <Link to="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </SignedIn>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle>Smart Goal Setting</CardTitle>
            </div>
            <CardDescription>
              Create and track personalized learning goals with AI assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Set SMART goals, break them down into manageable tasks, and track your progress with intelligent insights
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle>Daily Tasks</CardTitle>
            </div>
            <CardDescription>
              Structured daily learning tasks tailored to your goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Get personalized daily tasks, track completion, and build consistent learning habits
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle>Progress Analytics</CardTitle>
            </div>
            <CardDescription>
              Visual progress tracking and performance analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Monitor your learning streaks, completion rates, and skill development over time
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg">
                <Brain className="h-5 w-5 text-yellow-600" />
              </div>
              <CardTitle>AI-Powered Quizzes</CardTitle>
            </div>
            <CardDescription>
              Intelligent assessments to test your knowledge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Take adaptive quizzes that adjust to your skill level and provide detailed feedback
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                <Trophy className="h-5 w-5 text-red-600" />
              </div>
              <CardTitle>Achievements</CardTitle>
            </div>
            <CardDescription>
              Earn badges and celebrate your learning milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Stay motivated with achievement badges, streak rewards, and milestone celebrations
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg">
                <Zap className="h-5 w-5 text-indigo-600" />
              </div>
              <CardTitle>Smart Scheduling</CardTitle>
            </div>
            <CardDescription>
              Adaptive learning schedules that fit your lifestyle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              AI-optimized learning schedules that adapt to your pace and availability
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <SignedOut>
        <div className="text-center bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to accelerate your learning?</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of learners who are achieving their goals with SkillSprint AI. 
            Start your personalized learning journey today.
          </p>
          <SignUpButton mode="modal">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Start Learning Now
            </Button>
          </SignUpButton>
        </div>
      </SignedOut>
    </div>
  );
};

export default LandingPage;
