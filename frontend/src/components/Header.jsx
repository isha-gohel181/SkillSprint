import React from "react";
import { Link, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Target, BookOpen, TrendingUp, Brain } from "lucide-react";

const Header = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
            <Target className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            SkillSprint
          </span>
        </Link>

        <nav className="flex items-center space-x-4">
          <SignedIn>
            <Link to="/dashboard">
              <Button 
                variant={isActive("/dashboard") ? "default" : "ghost"}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link to="/goals">
              <Button 
                variant={isActive("/goals") ? "default" : "ghost"}
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Goals
              </Button>
            </Link>
            <Link to="/tasks">
              <Button 
                variant={isActive("/tasks") ? "default" : "ghost"}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Tasks
              </Button>
            </Link>
            <Link to="/progress">
              <Button 
                variant={isActive("/progress") ? "default" : "ghost"}
                className="flex items-center gap-2"
              >
                <Brain className="h-4 w-4" />
                Progress
              </Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
        </nav>
      </div>
    </header>
  );
};

export default Header;
