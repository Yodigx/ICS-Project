// Extending Window interface to add custom properties
declare global {
  interface Window {
    formatDate: (date: Date | number, format: string) => string;
  }
}

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  weight?: number;
  height?: number;
  age?: number;
  gender?: string;
  goal?: string;
  isTrainer: boolean;
  plan: string;
}

export interface Workout {
  id: number;
  name: string;
  description: string;
  duration: number;
  difficulty: string;
  equipmentRequired: string[];
  targetMuscleGroups: string[];
  imageUrl?: string;
}

export interface Exercise {
  id: number;
  name: string;
  description: string;
  muscleGroup: string;
  equipmentRequired?: string;
  difficultyLevel: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface WorkoutExercise {
  id: number;
  workoutId: number;
  exerciseId: number;
  sets: number;
  reps: number;
  restTime?: number;
  exercise: Exercise;
}

export interface Food {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  category: string;
  imageUrl?: string;
}

export interface Meal {
  foodId: number;
  time: string;
  type: string;
  quantity: number;
}

export interface MealPlan {
  id: number;
  userId: number;
  date: Date;
  meals: Meal[];
}

export interface WorkoutLog {
  id: number;
  userId: number;
  workoutId: number;
  date: Date;
  duration: number;
  caloriesBurned?: number;
  completed: boolean;
  workout: Workout;
}

export interface ProgressData {
  id: number;
  userId: number;
  date: Date;
  weight?: number;
  bodyFat?: number;
  notes?: string;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  message: string;
  timestamp: Date;
  read: boolean;
  sender: User;
}

export interface ClassSchedule {
  id: number;
  trainerId: number;
  className: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  maxParticipants: number;
  currentParticipants: number;
  trainer: User;
}

export interface ClassEnrollment {
  id: number;
  classId: number;
  userId: number;
  enrollmentDate: Date;
  class: ClassSchedule;
}

export interface LeaderboardEntry {
  user: User;
  points: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface QuickStat {
  title: string;
  value: string;
  target?: string;
  icon: string;
  iconBgClass: string;
  iconColor: string;
  progress: number;
  progressColor: string;
}
