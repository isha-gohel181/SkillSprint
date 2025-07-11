import React from "react";
import { Link } from "react-router-dom";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Target, Calendar, TrendingUp, Brain } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SkillSprint
          </div>
        </Link>

        <nav className="flex items-center space-x-1">
          <SignedIn>
            <Link to="/dashboard">
              <Button variant="ghost" className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            </Link>
            <Link to="/goals">
              <Button variant="ghost" className="flex items-center space-x-1">
                <Target className="h-4 w-4" />
                <span>Goals</span>
              </Button>
            </Link>
            <Link to="/tasks">
              <Button variant="ghost" className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Tasks</span>
              </Button>
            </Link>
            <Link to="/progress">
              <Button variant="ghost" className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4" />
                <span>Progress</span>
              </Button>
            </Link>
            <Link to="/quiz">
              <Button variant="ghost" className="flex items-center space-x-1">
                <Brain className="h-4 w-4" />
                <span>Quiz</span>
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="ghost">Profile</Button>
            </Link>
            <div className="ml-2">
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9"
                  }
                }}
              />
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button>Sign In</Button>
            </SignInButton>
          </SignedOut>
        </nav>
      </div>
    </header>
  );
};

export default Header;
