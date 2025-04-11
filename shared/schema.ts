import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  profileImage: text("profile_image"),
  weight: integer("weight"),
  height: integer("height"),
  age: integer("age"),
  gender: text("gender"),
  goal: text("goal"), // weight loss, muscle gain, etc.
  isTrainer: boolean("is_trainer").default(false),
  plan: text("plan").default("Basic")
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Workout Model
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  duration: integer("duration").notNull(), // in minutes
  difficulty: text("difficulty").notNull(),
  equipmentRequired: text("equipment_required").array(),
  targetMuscleGroups: text("target_muscle_groups").array(),
  imageUrl: text("image_url")
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true
});

export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Workout = typeof workouts.$inferSelect;

// Exercise Model
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  muscleGroup: text("muscle_group").notNull(),
  equipmentRequired: text("equipment_required"),
  difficultyLevel: text("difficulty_level").notNull(),
  imageUrl: text("image_url"),
  videoUrl: text("video_url")
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true
});

export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;

// Exercise in Workout (Junction)
export const workoutExercises = pgTable("workout_exercises", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id").notNull(),
  exerciseId: integer("exercise_id").notNull(),
  sets: integer("sets").notNull(),
  reps: integer("reps").notNull(),
  restTime: integer("rest_time") // in seconds
});

export const insertWorkoutExerciseSchema = createInsertSchema(workoutExercises).omit({
  id: true
});

export type InsertWorkoutExercise = z.infer<typeof insertWorkoutExerciseSchema>;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;

// Food Model
export const foods = pgTable("foods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull(), // in grams
  carbs: integer("carbs").notNull(), // in grams
  fat: integer("fat").notNull(), // in grams
  fiber: integer("fiber"), // in grams
  category: text("category").notNull(), // breakfast, lunch, dinner, snack
  imageUrl: text("image_url")
});

export const insertFoodSchema = createInsertSchema(foods).omit({
  id: true
});

export type InsertFood = z.infer<typeof insertFoodSchema>;
export type Food = typeof foods.$inferSelect;

// Meal Plan Model
export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  meals: jsonb("meals").notNull() // array of food items with time
});

export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({
  id: true
});

export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type MealPlan = typeof mealPlans.$inferSelect;

// Workout Log Model
export const workoutLogs = pgTable("workout_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  workoutId: integer("workout_id").notNull(),
  date: date("date").notNull(),
  duration: integer("duration").notNull(), // in minutes
  caloriesBurned: integer("calories_burned"),
  completed: boolean("completed").default(true)
});

export const insertWorkoutLogSchema = createInsertSchema(workoutLogs).omit({
  id: true
});

export type InsertWorkoutLog = z.infer<typeof insertWorkoutLogSchema>;
export type WorkoutLog = typeof workoutLogs.$inferSelect;

// Progress Model
export const progressData = pgTable("progress_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  weight: integer("weight"),
  bodyFat: integer("body_fat"),
  notes: text("notes")
});

export const insertProgressDataSchema = createInsertSchema(progressData).omit({
  id: true
});

export type InsertProgressData = z.infer<typeof insertProgressDataSchema>;
export type ProgressData = typeof progressData.$inferSelect;

// Message Model
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  read: boolean("read").default(false)
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Class Schedule Model
export const classSchedules = pgTable("class_schedules", {
  id: serial("id").primaryKey(),
  trainerId: integer("trainer_id").notNull(),
  className: text("class_name").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  maxParticipants: integer("max_participants").notNull(),
  currentParticipants: integer("current_participants").default(0)
});

export const insertClassScheduleSchema = createInsertSchema(classSchedules).omit({
  id: true
});

export type InsertClassSchedule = z.infer<typeof insertClassScheduleSchema>;
export type ClassSchedule = typeof classSchedules.$inferSelect;

// Class Enrollment Model
export const classEnrollments = pgTable("class_enrollments", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull(),
  userId: integer("user_id").notNull(),
  enrollmentDate: timestamp("enrollment_date").defaultNow().notNull()
});

export const insertClassEnrollmentSchema = createInsertSchema(classEnrollments).omit({
  id: true,
  enrollmentDate: true
});

export type InsertClassEnrollment = z.infer<typeof insertClassEnrollmentSchema>;
export type ClassEnrollment = typeof classEnrollments.$inferSelect;
