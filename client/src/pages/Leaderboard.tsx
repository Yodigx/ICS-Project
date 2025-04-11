import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { LeaderboardEntry } from "@/types";

export default function Leaderboard() {
  const [timeRange, setTimeRange] = useState<string>("week");
  
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['/api/leaderboard', timeRange],
  });

  const getLeaderboardColors = (position: number) => {
    switch(position) {
      case 0:
        return { bg: "bg-primary", border: "border-primary", text: "text-primary" };
      case 1:
        return { bg: "bg-secondary", border: "border-secondary", text: "text-secondary" };
      case 2:
        return { bg: "bg-accent", border: "border-accent", text: "text-accent" };
      default:
        return { bg: "bg-gray-200", border: "border-gray-300", text: "text-gray-700" };
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  return (
    <MainLayout title="Leaderboard">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Fitness Leaderboard</CardTitle>
              <CardDescription>See how you stack up against other users</CardDescription>
            </div>
            <Tabs 
              value={timeRange} 
              onValueChange={setTimeRange}
            >
              <TabsList>
                <TabsTrigger value="week">This Week</TabsTrigger>
                <TabsTrigger value="month">This Month</TabsTrigger>
                <TabsTrigger value="allTime">All Time</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(8)].map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboardData && leaderboardData.length > 0 ? (
                leaderboardData.map((entry: LeaderboardEntry, index: number) => {
                  const { bg, border, text } = getLeaderboardColors(index);
                  return (
                    <div 
                      key={entry.user.id} 
                      className={`flex items-center p-3 rounded-lg ${index === 0 ? 'bg-primary bg-opacity-5' : index === 1 ? 'bg-secondary bg-opacity-5' : index === 2 ? 'bg-accent bg-opacity-5' : 'hover:bg-gray-50'} transition`}
                    >
                      <div className={`w-8 h-8 rounded-full ${bg} text-white flex items-center justify-center font-bold text-sm mr-3`}>
                        {index + 1}
                      </div>
                      <Avatar className={`h-10 w-10 border-2 ${border}`}>
                        <AvatarImage 
                          src={entry.user.profileImage} 
                          alt={`${entry.user.firstName} ${entry.user.lastName}`} 
                        />
                        <AvatarFallback>
                          {getInitials(entry.user.firstName, entry.user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium">
                          {entry.user.firstName} {entry.user.lastName}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 mt-0.5">
                          <span className="mr-2">{entry.user.workoutLogs?.length || 0} workouts completed</span>
                          {entry.user.goal && (
                            <Badge variant="outline" className="capitalize text-xs">
                              {entry.user.goal.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className={`text-sm font-display font-semibold ${text}`}>
                        {entry.points} pts
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-8">
                  <p className="text-gray-500 mb-2">No leaderboard data available.</p>
                  <p className="text-gray-500 mb-4">Complete workouts to appear on the leaderboard!</p>
                  <Button asChild>
                    <a href="/workouts">Find a Workout</a>
                  </Button>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-6 space-y-4">
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">How Points Are Calculated</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Each completed workout: <span className="font-medium">35 points</span></p>
                <p>• Additional points per minute of workout: <span className="font-medium">1 point per 5 minutes</span></p>
                <p>• Streak bonus: <span className="font-medium">5 points per day of consecutive workouts</span></p>
                <p>• Completing your daily goals: <span className="font-medium">20 points</span></p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Monthly Rewards</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="border rounded-lg p-4 bg-primary bg-opacity-5">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs mr-2">
                      1
                    </div>
                    <span className="font-medium">1st Place</span>
                  </div>
                  <p className="text-gray-600">1 month free Premium membership + exclusive workout plan</p>
                </div>
                
                <div className="border rounded-lg p-4 bg-secondary bg-opacity-5">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-xs mr-2">
                      2
                    </div>
                    <span className="font-medium">2nd Place</span>
                  </div>
                  <p className="text-gray-600">2 weeks free Premium membership + workout accessories</p>
                </div>
                
                <div className="border rounded-lg p-4 bg-accent bg-opacity-5">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs mr-2">
                      3
                    </div>
                    <span className="font-medium">3rd Place</span>
                  </div>
                  <p className="text-gray-600">1 week free Premium membership + digital badge</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
