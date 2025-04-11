import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertWorkoutSchema, 
  insertExerciseSchema, 
  insertWorkoutExerciseSchema,
  insertFoodSchema,
  insertMealPlanSchema,
  insertWorkoutLogSchema,
  insertProgressDataSchema,
  insertMessageSchema,
  insertClassScheduleSchema,
  insertClassEnrollmentSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  const authRouter = express.Router();
  
  authRouter.post("/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  authRouter.post("/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to authenticate" });
    }
  });
  
  app.use("/api/auth", authRouter);
  
  // User routes
  const userRouter = express.Router();
  
  userRouter.get("/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  userRouter.patch("/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const userData = req.body;
      
      // Don't allow password updates through this endpoint
      if (userData.password) {
        delete userData.password;
      }
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  app.use("/api/users", userRouter);
  
  // Workout routes
  const workoutRouter = express.Router();
  
  workoutRouter.get("/", async (req: Request, res: Response) => {
    try {
      const workouts = await storage.getAllWorkouts();
      res.status(200).json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get workouts" });
    }
  });
  
  workoutRouter.get("/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      // Placeholder logic - in a real application, you'd have a way to
      // fetch workouts specific to a user (created by them or saved to their profile)
      // For demo, we're fetching all workouts
      const allWorkouts = await storage.getAllWorkouts();
      // For demo purposes, assume all workouts belong to the user
      res.status(200).json(allWorkouts.slice(0, 3));
    } catch (error) {
      res.status(500).json({ message: "Failed to get user workouts" });
    }
  });
  
  workoutRouter.get("/:id", async (req: Request, res: Response) => {
    try {
      const workoutId = parseInt(req.params.id);
      const workout = await storage.getWorkout(workoutId);
      
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      
      res.status(200).json(workout);
    } catch (error) {
      res.status(500).json({ message: "Failed to get workout" });
    }
  });
  
  workoutRouter.post("/", async (req: Request, res: Response) => {
    try {
      const workoutData = insertWorkoutSchema.parse(req.body);
      const workout = await storage.createWorkout(workoutData);
      res.status(201).json(workout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workout data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workout" });
    }
  });
  
  workoutRouter.get("/:id/exercises", async (req: Request, res: Response) => {
    try {
      const workoutId = parseInt(req.params.id);
      const workoutExercises = await storage.getWorkoutExercises(workoutId);
      res.status(200).json(workoutExercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to get workout exercises" });
    }
  });
  
  workoutRouter.post("/recommend", async (req: Request, res: Response) => {
    try {
      const { equipment, muscleGroups } = req.body;
      
      if (!Array.isArray(equipment) || !Array.isArray(muscleGroups)) {
        return res.status(400).json({ message: "Equipment and muscleGroups must be arrays" });
      }
      
      const workouts = await storage.recommendWorkouts(equipment, muscleGroups);
      res.status(200).json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to recommend workouts" });
    }
  });
  
  app.use("/api/workouts", workoutRouter);
  
  // Exercise routes
  const exerciseRouter = express.Router();
  
  exerciseRouter.get("/", async (req: Request, res: Response) => {
    try {
      const muscleGroup = req.query.muscleGroup as string;
      
      if (muscleGroup) {
        const exercises = await storage.getExercisesByMuscleGroup(muscleGroup);
        return res.status(200).json(exercises);
      }
      
      const exercises = await storage.getAllExercises();
      res.status(200).json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to get exercises" });
    }
  });
  
  exerciseRouter.get("/:id", async (req: Request, res: Response) => {
    try {
      const exerciseId = parseInt(req.params.id);
      const exercise = await storage.getExercise(exerciseId);
      
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.status(200).json(exercise);
    } catch (error) {
      res.status(500).json({ message: "Failed to get exercise" });
    }
  });
  
  exerciseRouter.post("/", async (req: Request, res: Response) => {
    try {
      const exerciseData = insertExerciseSchema.parse(req.body);
      const exercise = await storage.createExercise(exerciseData);
      res.status(201).json(exercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid exercise data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create exercise" });
    }
  });
  
  app.use("/api/exercises", exerciseRouter);
  
  // Workout Exercise routes
  const workoutExerciseRouter = express.Router();
  
  workoutExerciseRouter.post("/", async (req: Request, res: Response) => {
    try {
      const workoutExerciseData = insertWorkoutExerciseSchema.parse(req.body);
      const workoutExercise = await storage.addExerciseToWorkout(workoutExerciseData);
      res.status(201).json(workoutExercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workout exercise data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add exercise to workout" });
    }
  });
  
  app.use("/api/workout-exercises", workoutExerciseRouter);
  
  // Food routes
  const foodRouter = express.Router();
  
  foodRouter.get("/", async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string;
      
      if (category) {
        const foods = await storage.getFoodsByCategory(category);
        return res.status(200).json(foods);
      }
      
      const foods = await storage.getAllFoods();
      res.status(200).json(foods);
    } catch (error) {
      res.status(500).json({ message: "Failed to get foods" });
    }
  });
  
  foodRouter.get("/:id", async (req: Request, res: Response) => {
    try {
      const foodId = parseInt(req.params.id);
      const food = await storage.getFood(foodId);
      
      if (!food) {
        return res.status(404).json({ message: "Food not found" });
      }
      
      res.status(200).json(food);
    } catch (error) {
      res.status(500).json({ message: "Failed to get food" });
    }
  });
  
  foodRouter.post("/", async (req: Request, res: Response) => {
    try {
      const foodData = insertFoodSchema.parse(req.body);
      const food = await storage.createFood(foodData);
      res.status(201).json(food);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid food data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create food" });
    }
  });
  
  app.use("/api/foods", foodRouter);
  
  // Meal Plan routes
  const mealPlanRouter = express.Router();
  
  mealPlanRouter.get("/:userId/today", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const today = new Date();
      const formattedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const mealPlan = await storage.getMealPlan(userId, formattedDate);
      
      if (!mealPlan) {
        return res.status(404).json({ message: "Meal plan not found for today" });
      }
      
      res.status(200).json(mealPlan);
    } catch (error) {
      res.status(500).json({ message: "Failed to get meal plan" });
    }
  });
  
  mealPlanRouter.post("/", async (req: Request, res: Response) => {
    try {
      const mealPlanData = insertMealPlanSchema.parse(req.body);
      const mealPlan = await storage.createMealPlan(mealPlanData);
      res.status(201).json(mealPlan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid meal plan data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create meal plan" });
    }
  });
  
  mealPlanRouter.patch("/:id", async (req: Request, res: Response) => {
    try {
      const mealPlanId = parseInt(req.params.id);
      const mealPlanData = req.body;
      
      const updatedMealPlan = await storage.updateMealPlan(mealPlanId, mealPlanData);
      
      if (!updatedMealPlan) {
        return res.status(404).json({ message: "Meal plan not found" });
      }
      
      res.status(200).json(updatedMealPlan);
    } catch (error) {
      res.status(500).json({ message: "Failed to update meal plan" });
    }
  });
  
  app.use("/api/meal-plans", mealPlanRouter);
  
  // Workout Log routes
  const workoutLogRouter = express.Router();
  
  workoutLogRouter.get("/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const workoutLogs = await storage.getUserWorkoutLogs(userId);
      res.status(200).json(workoutLogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get workout logs" });
    }
  });
  
  workoutLogRouter.get("/user/:userId/range", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const workoutLogs = await storage.getWorkoutLogsInDateRange(userId, startDate, endDate);
      res.status(200).json(workoutLogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get workout logs" });
    }
  });
  
  workoutLogRouter.post("/", async (req: Request, res: Response) => {
    try {
      const workoutLogData = insertWorkoutLogSchema.parse(req.body);
      const workoutLog = await storage.createWorkoutLog(workoutLogData);
      res.status(201).json(workoutLog);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workout log data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workout log" });
    }
  });
  
  app.use("/api/workout-logs", workoutLogRouter);
  
  // Progress routes
  const progressRouter = express.Router();
  
  progressRouter.get("/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const progressData = await storage.getUserProgressData(userId);
      res.status(200).json(progressData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get progress data" });
    }
  });
  
  progressRouter.get("/user/:userId/range", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const progressData = await storage.getProgressInDateRange(userId, startDate, endDate);
      res.status(200).json(progressData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get progress data" });
    }
  });
  
  progressRouter.post("/", async (req: Request, res: Response) => {
    try {
      const progressData = insertProgressDataSchema.parse(req.body);
      const progress = await storage.createProgressData(progressData);
      res.status(201).json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid progress data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create progress data" });
    }
  });
  
  app.use("/api/progress", progressRouter);
  
  // Message routes
  const messageRouter = express.Router();
  
  messageRouter.get("/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const messages = await storage.getUserMessages(userId);
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get messages" });
    }
  });
  
  messageRouter.post("/", async (req: Request, res: Response) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create message" });
    }
  });
  
  messageRouter.patch("/:id/read", async (req: Request, res: Response) => {
    try {
      const messageId = parseInt(req.params.id);
      const updatedMessage = await storage.markMessageAsRead(messageId);
      
      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.status(200).json(updatedMessage);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });
  
  app.use("/api/messages", messageRouter);
  
  // Class Schedule routes
  const classScheduleRouter = express.Router();
  
  classScheduleRouter.get("/", async (req: Request, res: Response) => {
    try {
      const classSchedules = await storage.getAllClassSchedules();
      res.status(200).json(classSchedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to get class schedules" });
    }
  });
  
  classScheduleRouter.get("/trainer/:trainerId", async (req: Request, res: Response) => {
    try {
      const trainerId = parseInt(req.params.trainerId);
      const classSchedules = await storage.getTrainerClassSchedules(trainerId);
      res.status(200).json(classSchedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to get trainer class schedules" });
    }
  });
  
  classScheduleRouter.post("/", async (req: Request, res: Response) => {
    try {
      const classScheduleData = insertClassScheduleSchema.parse(req.body);
      const classSchedule = await storage.createClassSchedule(classScheduleData);
      res.status(201).json(classSchedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid class schedule data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create class schedule" });
    }
  });
  
  app.use("/api/class-schedules", classScheduleRouter);
  
  // Class Enrollment routes
  const classEnrollmentRouter = express.Router();
  
  classEnrollmentRouter.get("/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const enrollments = await storage.getUserEnrollments(userId);
      res.status(200).json(enrollments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user enrollments" });
    }
  });
  
  classEnrollmentRouter.post("/", async (req: Request, res: Response) => {
    try {
      const enrollmentData = insertClassEnrollmentSchema.parse(req.body);
      
      // Check if class exists and has space
      const classSchedule = await storage.getClassSchedule(enrollmentData.classId);
      
      if (!classSchedule) {
        return res.status(404).json({ message: "Class not found" });
      }
      
      if (classSchedule.currentParticipants >= classSchedule.maxParticipants) {
        return res.status(400).json({ message: "Class is full" });
      }
      
      const enrollment = await storage.enrollInClass(enrollmentData);
      res.status(201).json(enrollment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid enrollment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to enroll in class" });
    }
  });
  
  app.use("/api/class-enrollments", classEnrollmentRouter);
  
  // Leaderboard route
  app.get("/api/leaderboard", async (req: Request, res: Response) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.status(200).json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to get leaderboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
