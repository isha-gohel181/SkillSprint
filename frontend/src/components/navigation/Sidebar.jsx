import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Home,
  Target,
  CheckSquare,
  TrendingUp,
  Brain,
  User,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Goals',
    href: '/goals',
    icon: Target,
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    name: 'Progress',
    href: '/progress',
    icon: TrendingUp,
  },
  {
    name: 'Quizzes',
    href: '/quizzes',
    icon: Brain,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
  },
];

const Sidebar = ({ className }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "flex flex-col h-full bg-card border-r border-border",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SS</span>
            </div>
            <span className="font-bold text-lg">SkillSprint</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
                isCollapsed && "justify-center"
              )}
            >
              <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
              {!isCollapsed && item.name}
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-border">
        <div className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <span className="text-sm">Theme</span>
              <Moon className="h-4 w-4" />
            </div>
          )}
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>
    </div>
  );
};

const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="md:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={closeSidebar} />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">SS</span>
                </div>
                <span className="font-bold text-lg">SkillSprint</span>
              </div>
              <Button variant="ghost" size="sm" onClick={closeSidebar}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={closeSidebar}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Theme Toggle */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4" />
                  <span className="text-sm">Theme</span>
                  <Moon className="h-4 w-4" />
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export { Sidebar, MobileSidebar };