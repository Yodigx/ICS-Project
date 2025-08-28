import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Workout, Exercise } from "@/types";
import CreateWorkoutForm from "@/components/workouts/CreateWorkoutForm";

export default function Workouts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const [showCreateWorkoutForm, setShowCreateWorkoutForm] = useState<boolean>(false);
  
  const { data: workouts, isLoading: isLoadingWorkouts } = useQuery<Workout[]>({
    queryKey: ['/api/workouts'],
    enabled: !!user,
  });
  
  const { data: exercises, isLoading: isLoadingExercises } = useQuery<Exercise[]>({
    queryKey: ['/api/exercises'],
    enabled: !!user,
  });
  
  // Get user's custom workouts
  const { data: userWorkouts, isLoading: isLoadingUserWorkouts } = useQuery<Workout[]>({
    queryKey: ['/api/workouts/user', user?.id],
    enabled: !!user?.id,
  });

  const isLoading = isLoadingWorkouts || isLoadingExercises || isLoadingUserWorkouts;

  const toggleEquipment = (equipment: string) => {
    setSelectedEquipment(prev => 
      prev.includes(equipment) 
        ? prev.filter(e => e !== equipment) 
        : [...prev, equipment]
    );
  };

  const toggleMuscleGroup = (muscleGroup: string) => {
    setSelectedMuscleGroups(prev => 
      prev.includes(muscleGroup) 
        ? prev.filter(m => m !== muscleGroup) 
        : [...prev, muscleGroup]
    );
  };

  const startWorkout = async (workoutId: number) => {
    try {
      // Create a workout log to track this workout session
      const workoutLogData = {
        userId: user?.id,
        workoutId: workoutId,
        date: new Date(),
        duration: 0, // This will be updated when the workout is completed
        completed: false
      };
      
      await apiRequest('POST', '/api/workout-logs', workoutLogData);
      
      toast({
        title: "Workout Started",
        description: "Your workout has been started. Go crush it!",
      });
      
      // Navigate to timer or workout detail page if needed
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start workout. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get workouts filtered by equipment and muscle groups
  const filteredWorkouts = workouts?.filter((workout: Workout) => {
    const matchesEquipment = selectedEquipment.length === 0 || 
      selectedEquipment.some(eq => workout.equipmentRequired.includes(eq));
    
    const matchesMuscleGroups = selectedMuscleGroups.length === 0 || 
      selectedMuscleGroups.some(mg => workout.targetMuscleGroups.includes(mg));
    
    return matchesEquipment && matchesMuscleGroups;
  });

  // Get exercises by muscle group
  const getExercisesByMuscleGroup = (muscleGroup: string) => {
    return exercises?.filter((exercise: Exercise) => exercise.muscleGroup === muscleGroup) || [];
  };

  // Equipment options
  const equipmentOptions = ["none", "dumbbells", "barbell", "kettlebell", "resistance bands", "bench", "pull-up bar"];
  
  // Muscle group options
  const muscleGroupOptions = ["chest", "back", "shoulders", "arms", "legs", "core", "cardio"];

  return (
    <MainLayout title="Workouts">
      <Tabs defaultValue="discover">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="discover">Discover Workouts</TabsTrigger>
          <TabsTrigger value="exercises">Exercise Library</TabsTrigger>
          <TabsTrigger value="my-workouts">My Workouts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="discover" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Find Your Perfect Workout</CardTitle>
              <CardDescription>Filter by available equipment and target muscle groups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Available Equipment</h4>
                  <div className="flex flex-wrap gap-2">
                    {equipmentOptions.map(equipment => (
                      <Button
                        key={equipment}
                        variant={selectedEquipment.includes(equipment) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleEquipment(equipment)}
                        className="capitalize"
                      >
                        {equipment}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Target Muscle Groups</h4>
                  <div className="flex flex-wrap gap-2">
                    {muscleGroupOptions.map(muscleGroup => (
                      <Button
                        key={muscleGroup}
                        variant={selectedMuscleGroups.includes(muscleGroup) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleMuscleGroup(muscleGroup)}
                        className="capitalize"
                      >
                        {muscleGroup}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))
            ) : filteredWorkouts && filteredWorkouts.length > 0 ? (
              filteredWorkouts.map((workout: Workout) => (
                <Card key={workout.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{workout.name}</CardTitle>
                      <Badge>{workout.difficulty}</Badge>
                    </div>
                    <CardDescription>{workout.duration} mins</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{workout.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {workout.targetMuscleGroups.map(group => (
                        <Badge key={group} variant="outline" className="capitalize">{group}</Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {workout.equipmentRequired.map(equipment => (
                        <Badge key={equipment} variant="secondary" className="capitalize">{equipment}</Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => startWorkout(workout.id)}>
                      Start Workout
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center p-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-2">No workouts match your criteria.</p>
                <p className="text-gray-500">Try adjusting your filters or create a custom workout.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="exercises" className="space-y-6">
          <Tabs defaultValue="chest">
            <TabsList className="mb-4">
              {muscleGroupOptions.map(group => (
                <TabsTrigger key={group} value={group} className="capitalize">{group}</TabsTrigger>
              ))}
            </TabsList>
            
            {muscleGroupOptions.map(muscleGroup => (
              <TabsContent key={muscleGroup} value={muscleGroup}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-40 w-full" />
                    ))
                  ) : getExercisesByMuscleGroup(muscleGroup).length > 0 ? (
                    getExercisesByMuscleGroup(muscleGroup).map((exercise: Exercise) => (
                      <Card key={exercise.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{exercise.name}</CardTitle>
                          <CardDescription className="capitalize">
                            {exercise.difficultyLevel} • {exercise.equipmentRequired || 'No Equipment'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600">{exercise.description}</p>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" className="w-full">
                            View Details
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center p-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No {muscleGroup} exercises available.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
        
        <TabsContent value="my-workouts">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Your Saved Workouts</CardTitle>
                    <CardDescription>Workouts you've saved or created</CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateWorkoutForm(true)}>
                    Create Custom Workout
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingUserWorkouts ? (
                  Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full mb-3" />
                  ))
                ) : userWorkouts && userWorkouts.length > 0 ? (
                  <div className="space-y-3">
                    {userWorkouts.map((workout: Workout) => (
                      <div key={workout.id} className="flex justify-between items-center p-4 border rounded-lg hover:border-primary transition">
                        <div>
                          <h4 className="font-medium">{workout.name}</h4>
                          <p className="text-sm text-gray-500">{workout.targetMuscleGroups.join(', ')}</p>
                        </div>
                        <Button onClick={() => startWorkout(workout.id)}>
                          Start
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <p className="text-gray-500 mb-2">You don't have any saved workouts yet.</p>
                    <p className="text-gray-500 text-sm">Create your first custom workout to get started!</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Dialog open={showCreateWorkoutForm} onOpenChange={setShowCreateWorkoutForm}>
              <DialogContent className="sm:max-w-5xl">
                <DialogHeader>
                  <DialogTitle>Create Custom Workout</DialogTitle>
                  <DialogDescription>
                    Design your own workout with your favorite exercises
                  </DialogDescription>
                </DialogHeader>
                
                <CreateWorkoutForm onSuccess={() => {
                  setShowCreateWorkoutForm(false);
                  queryClient.invalidateQueries({ queryKey: ['/api/workouts'] });
                  queryClient.invalidateQueries({ queryKey: ['/api/workouts/user', user?.id] });
                }} />
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
