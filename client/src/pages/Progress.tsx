import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ProgressData, WorkoutLog } from "@/types";

export default function Progress() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [weight, setWeight] = useState<string>("");
  const [bodyFat, setBodyFat] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  
  const { data: progressData, isLoading: isLoadingProgress } = useQuery<ProgressData[]>({
    queryKey: ['/api/progress/user/' + (user?.id || 0)],
    enabled: !!user?.id,
  });

  const { data: workoutLogs, isLoading: isLoadingWorkouts } = useQuery<WorkoutLog[]>({
    queryKey: ['/api/workout-logs/user/' + (user?.id || 0)],
    enabled: !!user?.id,
  });

  const isLoading = isLoadingProgress || isLoadingWorkouts;

  const handleSubmitProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!weight) {
      toast({
        title: "Error",
        description: "Weight is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const progressEntry = {
        userId: user?.id,
        date: new Date(),
        weight: parseFloat(weight),
        bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
        notes: notes || undefined
      };
      
      await apiRequest('POST', '/api/progress', progressEntry);
      
      toast({
        title: "Progress Updated",
        description: "Your progress has been recorded successfully",
      });
      
      // Reset form
      setWeight("");
      setBodyFat("");
      setNotes("");
      
      // Refetch progress data
      queryClient.invalidateQueries({ queryKey: ['/api/progress/user/' + user?.id] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Transform data for the charts
  const prepareWeightData = () => {
    if (!progressData) return [];
    
    return progressData
      .sort((a: ProgressData, b: ProgressData) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((entry: ProgressData) => ({
        date: window.formatDate(new Date(entry.date), 'MMM d'),
        weight: entry.weight
      }));
  };

  const prepareWorkoutData = () => {
    if (!workoutLogs) return [];
    
    const logsWithDates = workoutLogs
      .filter((log: WorkoutLog) => log.completed)
      .map((log: WorkoutLog) => ({
        date: window.formatDate(new Date(log.date), 'MMM d'),
        calories: log.caloriesBurned,
        duration: log.duration
      }));

    // Group by date and sum calories and duration
    const groupedByDate = logsWithDates.reduce((acc: any, curr: any) => {
      if (!acc[curr.date]) {
        acc[curr.date] = { date: curr.date, calories: 0, duration: 0, count: 0 };
      }
      acc[curr.date].calories += curr.calories || 0;
      acc[curr.date].duration += curr.duration || 0;
      acc[curr.date].count += 1;
      return acc;
    }, {});

    return Object.values(groupedByDate);
  };

  return (
    <MainLayout title="Progress Tracking">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full grid sm:grid-cols-3 grid-cols-1 mb-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="weight">Weight & Body</TabsTrigger>
          <TabsTrigger value="workouts">Workout Progress</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weight Progress</CardTitle>
                <CardDescription>Track your weight changes over time</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {isLoadingProgress ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prepareWeightData()} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="weight" stroke="#F97316" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => document.getElementById('weight-form')?.scrollIntoView({ behavior: 'smooth' })}>
                  Log New Weight
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Workout Frequency</CardTitle>
                <CardDescription>Your workout consistency</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {isLoadingWorkouts ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prepareWorkoutData()} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/workouts">Find Workouts</a>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card id="weight-form">
            <CardHeader>
              <CardTitle>Log Today's Progress</CardTitle>
              <CardDescription>Keep track of your fitness journey</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitProgress} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg) *</Label>
                    <Input 
                      id="weight" 
                      type="number" 
                      placeholder="Enter your weight" 
                      value={weight} 
                      onChange={(e) => setWeight(e.target.value)}
                      step="0.1"
                      min="30"
                      max="250"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bodyFat">Body Fat % (optional)</Label>
                    <Input 
                      id="bodyFat" 
                      type="number" 
                      placeholder="Enter your body fat %" 
                      value={bodyFat} 
                      onChange={(e) => setBodyFat(e.target.value)}
                      step="0.1"
                      min="2"
                      max="50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Add any notes about your progress" 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">Save Progress</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="weight" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weight History</CardTitle>
              <CardDescription>Track your weight changes over time</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProgress ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : progressData && progressData.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 font-medium text-sm py-2 border-b">
                    <div>Date</div>
                    <div>Weight</div>
                    <div>Body Fat</div>
                  </div>
                  {progressData
                    .sort((a: ProgressData, b: ProgressData) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((entry: ProgressData) => (
                      <div key={entry.id} className="grid grid-cols-3 py-3 text-sm border-b">
                        <div>{window.formatDate(new Date(entry.date), 'MMM d, yyyy')}</div>
                        <div>{entry.weight} kg</div>
                        <div>{entry.bodyFat ? `${entry.bodyFat}%` : '-'}</div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center p-6">
                  <p className="text-gray-500">No weight entries recorded yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="workouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workout History</CardTitle>
              <CardDescription>Your completed workouts and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingWorkouts ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : workoutLogs && workoutLogs.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 font-medium text-sm py-2 border-b">
                    <div>Date</div>
                    <div>Workout</div>
                    <div>Duration</div>
                    <div>Calories</div>
                  </div>
                  {workoutLogs
                    .sort((a: WorkoutLog, b: WorkoutLog) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((log: WorkoutLog) => (
                      <div key={log.id} className="grid grid-cols-4 py-3 text-sm border-b">
                        <div>{window.formatDate(new Date(log.date), 'MMM d, yyyy')}</div>
                        <div>{log.workout.name}</div>
                        <div>{log.duration} mins</div>
                        <div>{log.caloriesBurned || '-'}</div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center p-6">
                  <p className="text-gray-500">No workouts completed yet.</p>
                  <Button className="mt-4" asChild>
                    <a href="/workouts">Find a Workout</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
