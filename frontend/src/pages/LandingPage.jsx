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
import { 
  Target, 
  Brain, 
  TrendingUp, 
  Users, 
  Star, 
  CheckCircle,
  Zap,
  BookOpen,
  Trophy,
  ArrowRight
} from "lucide-react";

const LandingPage = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8 py-12">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
            SkillSprint
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            AI-Powered Skill Building & Goal Tracking Platform
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your learning journey with intelligent goal breakdown, 
            personalized task management, and data-driven progress tracking.
          </p>
        </div>

        <SignedOut>
          <div className="space-y-4">
            <SignUpButton mode="modal">
              <Button size="lg" className="text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </SignUpButton>
            <p className="text-sm text-muted-foreground">
              Join thousands of learners achieving their goals
            </p>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="space-y-4">
            <p className="text-lg text-green-600 font-medium">Welcome back! Ready to continue your journey?</p>
            <Link to="/dashboard">
              <Button size="lg" className="text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </SignedIn>
      </div>

      {/* AI-Powered Features Demo */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
        <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-4">AI-Powered Goal Breakdown</h2>
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
          Simply describe your goal, and our AI will create a detailed learning path 
          with milestones, tasks, and resources tailored to your skill level.
        </p>
        <div className="bg-white rounded-xl p-6 max-w-2xl mx-auto shadow-sm">
          <div className="text-left space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-blue-600 font-medium">You:</span>
              <span>"I want to learn React development"</span>
            </div>
            <div className="flex items-start space-x-2 text-sm">
              <Brain className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
              <div className="space-y-1">
                <span className="text-purple-600 font-medium">AI Assistant:</span>
                <div className="text-gray-700">
                  <div>✅ Setup development environment</div>
                  <div>📚 Learn JavaScript fundamentals</div>
                  <div>⚛️ Master React components & hooks</div>
                  <div>🛠️ Build 3 practical projects</div>
                  <div>🎯 Complete certification quiz</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="relative overflow-hidden border-blue-200 hover:shadow-lg transition-shadow">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <CardHeader>
            <Target className="h-12 w-12 text-blue-600 mb-2" />
            <CardTitle className="text-xl">Smart Goal Setting</CardTitle>
            <CardDescription>
              AI-powered goal breakdown with personalized milestones and learning paths
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Intelligent milestone creation</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Skill-level assessment</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Resource recommendations</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-green-200 hover:shadow-lg transition-shadow">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
          <CardHeader>
            <TrendingUp className="h-12 w-12 text-green-600 mb-2" />
            <CardTitle className="text-xl">Progress Analytics</CardTitle>
            <CardDescription>
              Comprehensive tracking with insights and streak gamification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Visual progress charts</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Streak tracking & rewards</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Performance insights</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-amber-200 hover:shadow-lg transition-shadow">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
          <CardHeader>
            <BookOpen className="h-12 w-12 text-amber-600 mb-2" />
            <CardTitle className="text-xl">Interactive Learning</CardTitle>
            <CardDescription>
              Quizzes, assessments, and adaptive learning experiences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Auto-generated quizzes</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Knowledge validation</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Adaptive difficulty</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Features */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-purple-200">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Zap className="h-8 w-8 text-purple-600" />
              <div>
                <CardTitle className="text-xl">Task Intelligence</CardTitle>
                <CardDescription>Smart task management with AI insights</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Time estimation accuracy</span>
                <span className="font-medium text-purple-600">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{width: "92%"}}></div>
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              <li>• Difficulty-based task scheduling</li>
              <li>• Resource link curation</li>
              <li>• Progress-driven recommendations</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-indigo-200">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Trophy className="h-8 w-8 text-indigo-600" />
              <div>
                <CardTitle className="text-xl">Achievement System</CardTitle>
                <CardDescription>Gamified learning with rewards</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">🏆 Goal Master</div>
              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">🔥 Streak King</div>
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">📚 Learning Pro</div>
            </div>
            <ul className="space-y-2 text-sm">
              <li>• Milestone completion badges</li>
              <li>• Learning streak rewards</li>
              <li>• Community leaderboards</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Social Proof */}
      <div className="text-center space-y-8 bg-gray-50 rounded-2xl p-8">
        <h2 className="text-3xl font-bold">Trusted by Learners Worldwide</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-blue-600">10,000+</div>
            <div className="text-sm text-muted-foreground">Active Learners</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-green-600">50,000+</div>
            <div className="text-sm text-muted-foreground">Goals Achieved</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-purple-600">95%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
        </div>

        {/* Testimonial */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-1 mb-3 justify-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <blockquote className="text-lg font-medium italic mb-4">
              "SkillSprint completely transformed how I approach learning. The AI breakdown 
              of my goals into manageable tasks was a game-changer!"
            </blockquote>
            <div className="flex items-center justify-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                SM
              </div>
              <div className="text-left">
                <div className="font-medium">Sarah Miller</div>
                <div className="text-sm text-muted-foreground">Software Developer</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Final CTA */}
      <SignedOut>
        <div className="text-center space-y-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-12">
          <h2 className="text-3xl font-bold">Ready to Sprint Towards Your Goals?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Join thousands of successful learners who've transformed their skills with SkillSprint
          </p>
          <SignUpButton mode="modal">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </SignUpButton>
        </div>
      </SignedOut>
    </div>
  );
};

export default LandingPage;
