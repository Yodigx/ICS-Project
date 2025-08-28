import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  rest?: number;
}

interface WorkoutProps {
  name: string;
  description: string;
  exercises: Exercise[];
}

export function TodaysWorkout({ name, description, exercises }: WorkoutProps) {
  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary to-blue-500 text-white p-4">
        <h3 className="font-bold text-lg">Today's Workout</h3>
        <p className="text-blue-100">{name}</p>
      </CardHeader>
      <CardContent className="p-4">
        {exercises.map((exercise, index) => (
          <React.Fragment key={index}>
            <div className={index > 0 ? "mb-4 pt-4" : "mb-4"}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{exercise.name}</span>
                <span className="text-gray-500 text-sm">
                  {exercise.sets && exercise.reps
                    ? `${exercise.sets} sets × ${exercise.reps} reps`
                    : exercise.duration
                    ? `${exercise.duration}s work / ${exercise.rest}s rest`
                    : ""}
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16m-7 6h7"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    {exercise.weight && (
                      <>
                        <span>Last: {exercise.weight - 5}kg</span>
                        <span>Target: {exercise.weight}kg</span>
                      </>
                    )}
                    {exercise.duration && (
                      <>
                        <span>Intensity: High</span>
                        <span>Target: Max Effort</span>
                      </>
                    )}
                    {!exercise.weight && !exercise.duration && (
                      <>
                        <span>Last: {typeof exercise.reps === 'number' ? Math.max(exercise.reps - 2, 0) : 0} reps</span>
                        <span>Target: {typeof exercise.reps === 'number' ? exercise.reps : 0} reps</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {index < exercises.length - 1 && <Separator />}
          </React.Fragment>
        ))}
        
        <Button className="w-full mt-4">Start Workout</Button>
      </CardContent>
    </Card>
  );
}
