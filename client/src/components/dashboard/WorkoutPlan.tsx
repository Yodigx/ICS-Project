import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Workout, Exercise, WorkoutExercise } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import TimerModal from "@/components/timer/TimerModal";

export default function WorkoutPlan() {
  const { user } = useAuth();
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  
  // Get the workout for today
  const { data: workout, isLoading: isLoadingWorkout } = useQuery<Workout | undefined>({
    queryKey: ['/api/workouts/1'], // For demo, we're using a fixed workout ID
    enabled: !!user?.id,
  });

  // Get the exercises for the workout
  const { data: exercises, isLoading: isLoadingExercises } = useQuery<WorkoutExercise[]>({
    queryKey: ['/api/workouts/1/exercises'], // For demo, we're using a fixed workout ID
    enabled: !!workout,
  });

  const isLoading = isLoadingWorkout || isLoadingExercises;

  // Open the timer modal
  const openTimerModal = () => {
    setIsTimerModalOpen(true);
  };

  // Start workout handler
  const handleStartWorkout = () => {
    // In a real app, this would log the start of a workout session
    console.log("Starting workout:", workout?.name);
  };

  if (isLoading) {
    return (
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-4">TODAY'S WORKOUT</h4>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  // If no workout is available
  if (!workout) {
    return (
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-4">TODAY'S WORKOUT</h4>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-gray-600 mb-3">No workout scheduled for today.</p>
          <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition">
            Find a Workout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-500 mb-4">TODAY'S WORKOUT</h4>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h5 className="font-medium">{workout.name}</h5>
          <span className="bg-primary text-white text-xs px-2 py-1 rounded font-medium">
            {workout.duration} mins
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-3">{workout.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {exercises && exercises.map((item: WorkoutExercise) => (
            <div key={item.id} className="flex items-center bg-white p-3 rounded border border-gray-100">
              <div className="mr-3 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                <i className={`fas ${item.exercise.muscleGroup === 'cardio' ? 'fa-running' : 'fa-dumbbell'}`}></i>
              </div>
              <div>
                <h6 className="text-sm font-medium">{item.exercise.name}</h6>
                <p className="text-xs text-gray-500">{item.sets} sets x {item.reps} reps</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={handleStartWorkout}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition flex-1"
          >
            Start Workout
          </button>
          <button 
            onClick={openTimerModal}
            className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            <i className="fas fa-clock mr-1"></i> Set Timer
          </button>
        </div>
      </div>

      <TimerModal isOpen={isTimerModalOpen} onClose={() => setIsTimerModalOpen(false)} />
    </div>
  );
}
