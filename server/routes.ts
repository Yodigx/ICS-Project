import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertWorkoutSchema,
  insertMealSchema,
  insertUserProgressSchema,
  insertClassSchema,
  insertClassEnrollmentSchema,
  insertMessageSchema
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create memory store for sessions
  const MemoryStoreSession = MemoryStore(session);
  
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || "fitlife-secret",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
  
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure passport local strategy
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      if (user.password !== password) { // In production, use proper password hashing
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
  
  // Serialize and deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  
  // Middleware to check if user is authenticated
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };
  
  // Auth routes
  app.post("/api/auth/login", passport.authenticate("local"), (req: any, res) => {
    res.json({ user: req.user });
  });
  
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      req.login(newUser, (err: any) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after registration" });
        }
        return res.status(201).json({ user: newUser });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });
  
  app.get("/api/auth/user", (req: any, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  
  app.post("/api/auth/logout", (req: any, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });
  
  // User routes
  app.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      const role = req.query.role as string | undefined;
      const users = await storage.getUsers(role);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });
  
  // Workout routes
  app.get("/api/workouts", async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const equipment = req.query.equipment ? (req.query.equipment as string).split(',') : undefined;
      const workouts = await storage.getWorkouts(type, equipment);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching workouts" });
    }
  });
  
  app.get("/api/workouts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workout = await storage.getWorkout(id);
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      res.json(workout);
    } catch (error) {
      res.status(500).json({ message: "Error fetching workout" });
    }
  });
  
  app.post("/api/workouts", isAuthenticated, async (req, res) => {
    try {
      const workoutData = insertWorkoutSchema.parse(req.body);
      const workout = await storage.createWorkout(workoutData);
      res.status(201).json(workout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating workout" });
    }
  });
  
  // Meal routes
  app.get("/api/meals", async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const meals = await storage.getMeals(type);
      res.json(meals);
    } catch (error) {
      res.status(500).json({ message: "Error fetching meals" });
    }
  });
  
  app.get("/api/meals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const meal = await storage.getMeal(id);
      if (!meal) {
        return res.status(404).json({ message: "Meal not found" });
      }
      res.json(meal);
    } catch (error) {
      res.status(500).json({ message: "Error fetching meal" });
    }
  });
  
  app.post("/api/meals", isAuthenticated, async (req, res) => {
    try {
      const mealData = insertMealSchema.parse(req.body);
      const meal = await storage.createMeal(mealData);
      res.status(201).json(meal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating meal" });
    }
  });
  
  // User Progress routes
  app.get("/api/user-progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const progress = await storage.getUserProgress(userId, startDate, endDate);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user progress" });
    }
  });
  
  app.post("/api/user-progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const progressData = insertUserProgressSchema.parse({ ...req.body, userId });
      
      const progress = await storage.createUserProgress(progressData);
      res.status(201).json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating user progress" });
    }
  });
  
  // Class routes
  app.get("/api/classes", async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const classes = await storage.getClasses(type, startDate, endDate);
      res.json(classes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching classes" });
    }
  });
  
  app.get("/api/classes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const classData = await storage.getClass(id);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      res.json(classData);
    } catch (error) {
      res.status(500).json({ message: "Error fetching class" });
    }
  });
  
  app.post("/api/classes", isAuthenticated, async (req: any, res) => {
    try {
      // Only trainers can create classes
      if (req.user.role !== "trainer") {
        return res.status(403).json({ message: "Only trainers can create classes" });
      }
      
      const classData = insertClassSchema.parse({ ...req.body, trainerId: req.user.id });
      const newClass = await storage.createClass(classData);
      res.status(201).json(newClass);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating class" });
    }
  });
  
  // Class Enrollment routes
  app.get("/api/enrollments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const enrollments = await storage.getClassEnrollments(undefined, userId);
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching enrollments" });
    }
  });
  
  app.post("/api/enrollments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const enrollmentData = insertClassEnrollmentSchema.parse({ ...req.body, userId });
      
      // Check if already enrolled
      const existingEnrollments = await storage.getClassEnrollments(enrollmentData.classId, userId);
      if (existingEnrollments.length > 0) {
        return res.status(400).json({ message: "Already enrolled in this class" });
      }
      
      // Check if class exists and has space
      const classData = await storage.getClass(enrollmentData.classId);
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
      
      if (classData.maxParticipants && classData.currentParticipants >= classData.maxParticipants) {
        return res.status(400).json({ message: "Class is full" });
      }
      
      // Create enrollment and update class participant count
      const enrollment = await storage.createClassEnrollment(enrollmentData);
      await storage.updateClassParticipants(enrollmentData.classId, true);
      
      res.status(201).json(enrollment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating enrollment" });
    }
  });
  
  app.delete("/api/enrollments/:classId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const classId = parseInt(req.params.classId);
      
      const success = await storage.deleteClassEnrollment(classId, userId);
      if (!success) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      
      // Update class participant count
      await storage.updateClassParticipants(classId, false);
      
      res.json({ message: "Enrollment canceled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error canceling enrollment" });
    }
  });
  
  // Message routes
  app.get("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get messages sent to or by the user
      const sentMessages = await storage.getMessages(userId);
      const receivedMessages = await storage.getMessages(undefined, userId);
      
      const messages = [...sentMessages, ...receivedMessages]
        .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages" });
    }
  });
  
  app.post("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.id;
      const messageData = insertMessageSchema.parse({ ...req.body, senderId });
      
      // Check if receiver exists
      const receiver = await storage.getUser(messageData.receiverId);
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }
      
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Error sending message" });
    }
  });
  
  app.put("/api/messages/:id/read", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.markMessageAsRead(id);
      if (!success) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json({ message: "Message marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Error updating message" });
    }
  });
  
  // Dashboard data
  app.get("/api/dashboard", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const dashboardData = await storage.getUserDashboardData(userId);
      res.json(dashboardData);
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard data" });
    }
  });
  
  // Leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Error fetching leaderboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
