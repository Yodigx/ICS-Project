import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Exercise } from "@/types";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Plus, MinusCircle } from "lucide-react";

const workoutSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  duration: z.coerce.number().min(5, "Duration must be at least 5 minutes"),
  difficulty: z.string().min(1, "Please select a difficulty level"),
  equipmentRequired: z.array(z.string()).optional(),
  targetMuscleGroups: z.array(z.string()).min(1, "Select at least one muscle group"),
});

type WorkoutFormValues = z.infer<typeof workoutSchema>;

export default function CreateWorkoutForm({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedExercises, setSelectedExercises] = useState<{ exerciseId: number; sets: number; reps: number; restTime: number }[]>([]);

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      name: "",
      description: "",
      duration: 30,
      difficulty: "",
      equipmentRequired: [],
      targetMuscleGroups: [],
    },
  });

  const { data: exercises } = useQuery<Exercise[]>({
    queryKey: ['/api/exercises'],
    enabled: !!user,
  });

  const equipmentOptions = ["none", "dumbbells", "barbell", "kettlebell", "resistance bands", "bench", "pull-up bar"];
  const muscleGroupOptions = ["chest", "back", "shoulders", "arms", "legs", "core", "cardio"];
  const difficultyOptions = ["beginner", "intermediate", "advanced"];

  const handleAddExercise = (exerciseId: number) => {
    setSelectedExercises(prev => [...prev, { exerciseId, sets: 3, reps: 10, restTime: 60 }]);
  };

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (index: number, field: string, value: number) => {
    setSelectedExercises(prev => 
      prev.map((exercise, i) => 
        i === index ? { ...exercise, [field]: value } : exercise
      )
    );
  };

  const getExerciseName = (id: number) => {
    return exercises?.find((exercise: Exercise) => exercise.id === id)?.name || "";
  };

  const onSubmit = async (data: WorkoutFormValues) => {
    if (selectedExercises.length === 0) {
      toast({
        title: "No exercises selected",
        description: "Please add at least one exercise to your workout",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create workout
      const workoutResponse = await apiRequest('POST', '/api/workouts', data);
      const workout = await workoutResponse.json();
      
      // Add exercises to workout
      for (const exercise of selectedExercises) {
        await apiRequest('POST', '/api/workout-exercises', {
          workoutId: workout.id,
          exerciseId: exercise.exerciseId,
          sets: exercise.sets,
          reps: exercise.reps,
          restTime: exercise.restTime,
        });
      }
      
      // Update UI
      queryClient.invalidateQueries({ queryKey: ['/api/workouts'] });
      
      toast({
        title: "Workout Created",
        description: `${workout.name} has been successfully created`,
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create workout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workout Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Upper Body Blast" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of the workout" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" min={5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {difficultyOptions.map(option => (
                          <SelectItem key={option} value={option} className="capitalize">{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="targetMuscleGroups"
              render={() => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Target Muscle Groups</FormLabel>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {muscleGroupOptions.map(option => (
                      <FormField
                        key={option}
                        control={form.control}
                        name="targetMuscleGroups"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={option}
                              className="flex flex-row items-start space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={(field.value ?? []).includes(option)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value ?? [];
                                    return checked
                                      ? field.onChange([...current, option])
                                      : field.onChange(
                                          current.filter(
                                            (value: string) => value !== option
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal capitalize">
                                {option}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="equipmentRequired"
              render={() => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>Equipment Required</FormLabel>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {equipmentOptions.map(option => (
                      <FormField
                        key={option}
                        control={form.control}
                        name="equipmentRequired"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={option}
                              className="flex flex-row items-start space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={(field.value ?? []).includes(option)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value ?? [];
                                    return checked
                                      ? field.onChange([...current, option])
                                      : field.onChange(
                                          current.filter(
                                            (value: string) => value !== option
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal capitalize">
                                {option}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Add Exercises</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <Select onValueChange={(value) => handleAddExercise(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exercises?.map((exercise: Exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id.toString()}>
                      {exercise.name} ({exercise.muscleGroup})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              {selectedExercises.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No exercises added yet.</p>
                  <p className="text-gray-500 text-sm">Select exercises from the dropdown above.</p>
                </div>
              ) : (
                selectedExercises.map((exercise, index) => (
                  <Card key={`${exercise.exerciseId}-${index}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium">{getExerciseName(exercise.exerciseId)}</div>
                          <div className="text-sm text-gray-500">
                            {exercise.sets} sets × {exercise.reps} reps
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveExercise(index)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs">Sets</label>
                          <Input 
                            type="number" 
                            value={exercise.sets} 
                            min={1}
                            max={10}
                            onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="text-xs">Reps</label>
                          <Input 
                            type="number" 
                            value={exercise.reps} 
                            min={1}
                            max={100}
                            onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="text-xs">Rest (sec)</label>
                          <Input 
                            type="number" 
                            value={exercise.restTime}
                            min={0}
                            max={300}
                            onChange={(e) => handleExerciseChange(index, 'restTime', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit">Create Workout</Button>
        </div>
      </form>
    </Form>
  );
}