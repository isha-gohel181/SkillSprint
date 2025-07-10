import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { sampleGoals } from '@/services/mockData';
import { Plus, Target, Calendar, TrendingUp, Search, Filter } from 'lucide-react';

const GoalsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Get unique categories
  const categories = ['all', ...new Set(sampleGoals.map(goal => goal.category))];
  
  // Filter goals based on search and filters
  const filteredGoals = sampleGoals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || goal.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || goal.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeGoals = filteredGoals.filter(goal => goal.status === 'active');
  const completedGoals = filteredGoals.filter(goal => goal.status === 'completed');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Goals</h1>
          <p className="text-muted-foreground">
            Track and manage your learning objectives
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search goals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredGoals.length}</div>
            <p className="text-xs text-muted-foreground">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' ? 'filtered' : 'total'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGoals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedGoals.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            Active Goals ({activeGoals.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed Goals ({completedGoals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeGoals.map((goal) => (
              <Card key={goal.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {goal.description}
                      </CardDescription>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {goal.category}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} />
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    Due {new Date(goal.targetDate).toLocaleDateString()}
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button size="sm">
                      Update Progress
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {activeGoals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || selectedCategory !== 'all' 
                ? 'No active goals match your filters.' 
                : 'No active goals. Create your first goal to get started!'}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedGoals.map((goal) => (
              <Card key={goal.id} className="opacity-75">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {goal.description}
                      </CardDescription>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 px-2 py-1 rounded-full">
                      Completed
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Progress value={100} />
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    Completed {new Date(goal.targetDate).toLocaleDateString()}
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {completedGoals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || selectedCategory !== 'all' 
                ? 'No completed goals match your filters.' 
                : 'No completed goals yet. Keep working on your active goals!'}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GoalsPage;