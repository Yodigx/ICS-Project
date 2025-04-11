import {
  users, type User, type InsertUser,
  workouts, type Workout, type InsertWorkout,
  meals, type Meal, type InsertMeal,
  userProgress, type UserProgress, type InsertUserProgress,
  classes, type Class, type InsertClass,
  classEnrollments, type ClassEnrollment, type InsertClassEnrollment,
  messages, type Message, type InsertMessage
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(role?: string): Promise<User[]>;
  
  // Workout methods
  getWorkout(id: number): Promise<Workout | undefined>;
  getWorkouts(type?: string, equipment?: string[]): Promise<Workout[]>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  
  // Meal methods
  getMeal(id: number): Promise<Meal | undefined>;
  getMeals(type?: string): Promise<Meal[]>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  
  // UserProgress methods
  getUserProgress(userId: number, startDate?: Date, endDate?: Date): Promise<UserProgress[]>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  
  // Class methods
  getClass(id: number): Promise<Class | undefined>;
  getClasses(type?: string, startDate?: Date, endDate?: Date): Promise<Class[]>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClassParticipants(classId: number, increment: boolean): Promise<Class | undefined>;
  
  // Class Enrollment methods
  getClassEnrollments(classId?: number, userId?: number): Promise<ClassEnrollment[]>;
  createClassEnrollment(enrollment: InsertClassEnrollment): Promise<ClassEnrollment>;
  deleteClassEnrollment(classId: number, userId: number): Promise<boolean>;
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  getMessages(senderId?: number, receiverId?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<boolean>;
  
  // Dashboard Data
  getUserDashboardData(userId: number): Promise<any>;
  getLeaderboard(): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workouts: Map<number, Workout>;
  private meals: Map<number, Meal>;
  private userProgresses: Map<number, UserProgress>;
  private classes: Map<number, Class>;
  private classEnrollments: Map<number, ClassEnrollment>;
  private messages: Map<number, Message>;
  private currentIds: {
    users: number;
    workouts: number;
    meals: number;
    userProgresses: number;
    classes: number;
    classEnrollments: number;
    messages: number;
  };

  constructor() {
    this.users = new Map();
    this.workouts = new Map();
    this.meals = new Map();
    this.userProgresses = new Map();
    this.classes = new Map();
    this.classEnrollments = new Map();
    this.messages = new Map();
    this.currentIds = {
      users: 1,
      workouts: 1,
      meals: 1,
      userProgresses: 1,
      classes: 1,
      classEnrollments: 1,
      messages: 1,
    };
    
    // Initialize with sample data
    this.initializeData();
  }

  // Initialize with some basic data for demo purposes
  private initializeData() {
    // Add some users
    const users = [
      { username: "ananya", password: "password123", email: "ananya@example.com", fullName: "Ananya Sharma", city: "Bangalore", role: "user" },
      { username: "priya", password: "password123", email: "priya@example.com", fullName: "Priya Patel", city: "Mumbai", role: "trainer" },
      { username: "rahul", password: "password123", email: "rahul@example.com", fullName: "Rahul Kumar", city: "Delhi", role: "trainer" },
      { username: "arjun", password: "password123", email: "arjun@example.com", fullName: "Arjun Patel", city: "Mumbai", role: "user" },
      { username: "diya", password: "password123", email: "diya@example.com", fullName: "Diya Sharma", city: "Delhi", role: "user" },
    ];
    
    users.forEach(user => this.createUser(user));
    
    // Add some workouts
    const workouts = [
      {
        name: "Upper Body Strength",
        description: "A workout focused on building upper body strength",
        type: "strength",
        equipmentNeeded: ["dumbbells", "bench"],
        exercises: [
          { name: "Bench Press", sets: 3, reps: 12, weight: 45 },
          { name: "Pull-ups", sets: 3, reps: 8 },
          { name: "Shoulder Press", sets: 3, reps: 10, weight: 27.5 }
        ]
      },
      {
        name: "Lower Body Power",
        description: "A workout focused on building lower body power",
        type: "strength",
        equipmentNeeded: ["barbell", "squat rack"],
        exercises: [
          { name: "Squats", sets: 4, reps: 10, weight: 60 },
          { name: "Deadlifts", sets: 3, reps: 8, weight: 80 },
          { name: "Lunges", sets: 3, reps: 12, weight: 20 }
        ]
      },
      {
        name: "HIIT Cardio",
        description: "High-intensity interval training for cardiovascular fitness",
        type: "cardio",
        equipmentNeeded: [],
        exercises: [
          { name: "Jumping Jacks", duration: 45, rest: 15 },
          { name: "Burpees", duration: 45, rest: 15 },
          { name: "Mountain Climbers", duration: 45, rest: 15 },
          { name: "High Knees", duration: 45, rest: 15 }
        ]
      }
    ];
    
    workouts.forEach(workout => this.createWorkout(workout));
    
    // Add some meals
    const meals = [
      {
        name: "Masala Oats with Vegetables",
        description: "Nutritious breakfast option packed with protein and fiber",
        type: "breakfast",
        calories: 420,
        protein: 28,
        carbs: 55,
        fats: 10,
        image: "https://images.unsplash.com/photo-1525351484163-7529414344d8",
        ingredients: ["oats", "mixed vegetables", "olive oil", "spices"]
      },
      {
        name: "Paneer Salad with Mixed Greens",
        description: "Protein-rich lunch option with fresh vegetables",
        type: "lunch",
        calories: 580,
        protein: 32,
        carbs: 30,
        fats: 35,
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
        ingredients: ["paneer", "mixed greens", "cherry tomatoes", "cucumber", "olive oil", "lemon juice"]
      },
      {
        name: "Dal Tadka with Brown Rice",
        description: "Traditional Indian dinner rich in protein and complex carbs",
        type: "dinner",
        calories: 520,
        protein: 18,
        carbs: 70,
        fats: 15,
        image: "https://images.unsplash.com/photo-1547592180-85f173990554",
        ingredients: ["lentils", "brown rice", "spices", "ghee"]
      }
    ];
    
    meals.forEach(meal => this.createMeal(meal));
    
    // Add some classes
    const now = new Date();
    const todayAt530PM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 30);
    const tomorrowAt7AM = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 7, 0);
    const wednesdayAt6PM = new Date(now.getFullYear(), now.getMonth(), now.getDate() + ((3 - now.getDay() + 7) % 7), 18, 0);
    
    const classes = [
      {
        name: "Yoga with Priya",
        description: "A calming yoga session to improve flexibility and reduce stress",
        trainerId: 2, // Priya's ID
        startTime: todayAt530PM,
        duration: 45,
        maxParticipants: 20,
        type: "yoga"
      },
      {
        name: "HIIT with Rahul",
        description: "High-intensity interval training for maximum calorie burn",
        trainerId: 3, // Rahul's ID
        startTime: tomorrowAt7AM,
        duration: 30,
        maxParticipants: 15,
        type: "hiit"
      },
      {
        name: "Strength Training",
        description: "Build muscle and improve overall strength",
        trainerId: 3, // Rahul's ID
        startTime: wednesdayAt6PM,
        duration: 60,
        maxParticipants: 12,
        type: "strength"
      }
    ];
    
    classes.forEach(classData => this.createClass(classData));
    
    // Enroll Ananya in Yoga class
    this.createClassEnrollment({ classId: 1, userId: 1 });
    // Update class participant count
    this.updateClassParticipants(1, true);
    
    // Add some user progress data for Ananya
    const userProgressData = [
      {
        userId: 1,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6),
        workoutCompleted: true,
        workoutId: 1,
        workoutDuration: 45,
        caloriesBurned: 350,
        caloriesConsumed: 1800,
        waterIntake: 2.0,
      },
      {
        userId: 1,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
        workoutCompleted: true,
        workoutId: 2,
        workoutDuration: 60,
        caloriesBurned: 420,
        caloriesConsumed: 1750,
        waterIntake: 2.2,
      },
      {
        userId: 1,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 4),
        workoutCompleted: false,
        caloriesConsumed: 1900,
        waterIntake: 1.8,
      },
      {
        userId: 1,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3),
        workoutCompleted: true,
        workoutId: 3,
        workoutDuration: 30,
        caloriesBurned: 280,
        caloriesConsumed: 1820,
        waterIntake: 1.5,
      },
      {
        userId: 1,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
        workoutCompleted: true,
        workoutId: 1,
        workoutDuration: 75,
        caloriesBurned: 510,
        caloriesConsumed: 1700,
        waterIntake: 2.5,
      },
      {
        userId: 1,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
        workoutCompleted: true,
        workoutId: 2,
        workoutDuration: 90,
        caloriesBurned: 650,
        caloriesConsumed: 1770,
        waterIntake: 2.0,
      },
      {
        userId: 1,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        workoutCompleted: false,
        caloriesConsumed: 1245,
        waterIntake: 1.5,
      }
    ];
    
    userProgressData.forEach(progress => this.createUserProgress(progress));
    
    // Add some messages
    const messages = [
      {
        senderId: 2, // Priya
        receiverId: 1, // Ananya
        content: "Hi Ananya, are you ready for our yoga session today?"
      },
      {
        senderId: 1, // Ananya
        receiverId: 2, // Priya
        content: "Yes, I'm looking forward to it!"
      },
      {
        senderId: 3, // Rahul
        receiverId: 1, // Ananya
        content: "Don't forget to bring a yoga mat to class today!"
      }
    ];
    
    messages.forEach(message => this.createMessage(message));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  async getUsers(role?: string): Promise<User[]> {
    let users = Array.from(this.users.values());
    if (role) {
      users = users.filter(user => user.role === role);
    }
    return users;
  }

  // Workout methods
  async getWorkout(id: number): Promise<Workout | undefined> {
    return this.workouts.get(id);
  }
  
  async getWorkouts(type?: string, equipment?: string[]): Promise<Workout[]> {
    let workouts = Array.from(this.workouts.values());
    
    if (type) {
      workouts = workouts.filter(workout => workout.type === type);
    }
    
    if (equipment && equipment.length > 0) {
      workouts = workouts.filter(workout => 
        equipment.some(eq => workout.equipmentNeeded.includes(eq))
      );
    }
    
    return workouts;
  }
  
  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const id = this.currentIds.workouts++;
    const now = new Date();
    const workout: Workout = { ...insertWorkout, id, createdAt: now };
    this.workouts.set(id, workout);
    return workout;
  }

  // Meal methods
  async getMeal(id: number): Promise<Meal | undefined> {
    return this.meals.get(id);
  }
  
  async getMeals(type?: string): Promise<Meal[]> {
    let meals = Array.from(this.meals.values());
    
    if (type) {
      meals = meals.filter(meal => meal.type === type);
    }
    
    return meals;
  }
  
  async createMeal(insertMeal: InsertMeal): Promise<Meal> {
    const id = this.currentIds.meals++;
    const now = new Date();
    const meal: Meal = { ...insertMeal, id, createdAt: now };
    this.meals.set(id, meal);
    return meal;
  }

  // UserProgress methods
  async getUserProgress(userId: number, startDate?: Date, endDate?: Date): Promise<UserProgress[]> {
    let progress = Array.from(this.userProgresses.values())
      .filter(p => p.userId === userId);
    
    if (startDate) {
      progress = progress.filter(p => p.date >= startDate);
    }
    
    if (endDate) {
      progress = progress.filter(p => p.date <= endDate);
    }
    
    return progress.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  
  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const id = this.currentIds.userProgresses++;
    const progress: UserProgress = { ...insertProgress, id };
    this.userProgresses.set(id, progress);
    return progress;
  }

  // Class methods
  async getClass(id: number): Promise<Class | undefined> {
    return this.classes.get(id);
  }
  
  async getClasses(type?: string, startDate?: Date, endDate?: Date): Promise<Class[]> {
    let classes = Array.from(this.classes.values());
    
    if (type) {
      classes = classes.filter(c => c.type === type);
    }
    
    if (startDate) {
      classes = classes.filter(c => c.startTime >= startDate);
    }
    
    if (endDate) {
      classes = classes.filter(c => c.startTime <= endDate);
    }
    
    return classes.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }
  
  async createClass(insertClass: InsertClass): Promise<Class> {
    const id = this.currentIds.classes++;
    const now = new Date();
    const classData: Class = { ...insertClass, id, currentParticipants: 0, createdAt: now };
    this.classes.set(id, classData);
    return classData;
  }
  
  async updateClassParticipants(classId: number, increment: boolean): Promise<Class | undefined> {
    const classData = this.classes.get(classId);
    if (!classData) return undefined;
    
    if (increment) {
      if (classData.maxParticipants && classData.currentParticipants >= classData.maxParticipants) {
        throw new Error("Class is full");
      }
      classData.currentParticipants += 1;
    } else {
      if (classData.currentParticipants > 0) {
        classData.currentParticipants -= 1;
      }
    }
    
    this.classes.set(classId, classData);
    return classData;
  }

  // Class Enrollment methods
  async getClassEnrollments(classId?: number, userId?: number): Promise<ClassEnrollment[]> {
    let enrollments = Array.from(this.classEnrollments.values());
    
    if (classId) {
      enrollments = enrollments.filter(e => e.classId === classId);
    }
    
    if (userId) {
      enrollments = enrollments.filter(e => e.userId === userId);
    }
    
    return enrollments;
  }
  
  async createClassEnrollment(insertEnrollment: InsertClassEnrollment): Promise<ClassEnrollment> {
    const id = this.currentIds.classEnrollments++;
    const now = new Date();
    const enrollment: ClassEnrollment = { ...insertEnrollment, id, enrolledAt: now };
    this.classEnrollments.set(id, enrollment);
    return enrollment;
  }
  
  async deleteClassEnrollment(classId: number, userId: number): Promise<boolean> {
    const enrollments = Array.from(this.classEnrollments.values());
    const enrollment = enrollments.find(e => e.classId === classId && e.userId === userId);
    
    if (enrollment) {
      this.classEnrollments.delete(enrollment.id);
      return true;
    }
    
    return false;
  }

  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async getMessages(senderId?: number, receiverId?: number): Promise<Message[]> {
    let messages = Array.from(this.messages.values());
    
    if (senderId) {
      messages = messages.filter(m => m.senderId === senderId);
    }
    
    if (receiverId) {
      messages = messages.filter(m => m.receiverId === receiverId);
    }
    
    return messages.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentIds.messages++;
    const now = new Date();
    const message: Message = { ...insertMessage, id, read: false, sentAt: now };
    this.messages.set(id, message);
    return message;
  }
  
  async markMessageAsRead(id: number): Promise<boolean> {
    const message = this.messages.get(id);
    if (!message) return false;
    
    message.read = true;
    this.messages.set(id, message);
    return true;
  }

  // Dashboard Data
  async getUserDashboardData(userId: number): Promise<any> {
    // Get user
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    // Get today's progress
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    const todayProgress = (await this.getUserProgress(userId, today, tomorrow))[0] || {
      caloriesConsumed: 0,
      waterIntake: 0,
    };
    
    // Get recent progress for streak calculation
    const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const recentProgress = await this.getUserProgress(userId, weekAgo);
    
    // Calculate workout streak
    let streak = 0;
    for (let i = 1; i <= 7; i++) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const progress = recentProgress.find(p => 
        p.date.getFullYear() === date.getFullYear() && 
        p.date.getMonth() === date.getMonth() && 
        p.date.getDate() === date.getDate()
      );
      
      if (progress && progress.workoutCompleted) {
        streak++;
      } else {
        break;
      }
    }
    
    // Get upcoming classes
    const userEnrollments = await this.getClassEnrollments(undefined, userId);
    const enrolledClassIds = userEnrollments.map(e => e.classId);
    
    let upcomingClasses = (await this.getClasses(undefined, now))
      .filter(c => c.startTime >= now)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, 3);
    
    // Add enrollment status
    upcomingClasses = await Promise.all(upcomingClasses.map(async (c) => {
      const trainer = await this.getUser(c.trainerId);
      return {
        ...c,
        enrolled: enrolledClassIds.includes(c.id),
        trainerName: trainer ? trainer.fullName : 'Unknown'
      };
    }));
    
    // Get next session
    const nextClass = upcomingClasses.find(c => enrolledClassIds.includes(c.id));
    
    // Calculate time until next session
    let nextSession = null;
    if (nextClass) {
      const diffMs = nextClass.startTime.getTime() - now.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      nextSession = {
        timeUntil: `${diffHrs}h ${diffMins}m`,
        className: nextClass.name,
        trainerName: nextClass.trainerName,
        time: nextClass.startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      };
    }
    
    // Get weekly activity data
    const weeklyData = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayProgress = recentProgress.find(p => 
        p.date.getFullYear() === date.getFullYear() && 
        p.date.getMonth() === date.getMonth() && 
        p.date.getDate() === date.getDate()
      );
      
      weeklyData.push({
        day: days[date.getDay()],
        workoutDuration: dayProgress?.workoutDuration || 0,
        caloriesBurned: dayProgress?.caloriesBurned || 0
      });
    }
    
    // Get today's workout
    const workouts = await this.getWorkouts();
    const todayWorkout = workouts[0]; // Just using the first workout for demo purposes
    
    // Get meal plan
    const meals = await this.getMeals();
    const mealPlan = {
      breakfast: meals.find(m => m.type === 'breakfast'),
      lunch: meals.find(m => m.type === 'lunch'),
      dinner: meals.find(m => m.type === 'dinner')
    };
    
    return {
      user,
      todayStats: {
        caloriesConsumed: todayProgress.caloriesConsumed || 0,
        waterIntake: todayProgress.waterIntake || 0,
        workoutStreak: streak,
        nextSession
      },
      weeklyActivity: weeklyData,
      nutritionBreakdown: {
        protein: { current: 78, goal: 120 },
        carbs: { current: 105, goal: 250 },
        fats: { current: 48, goal: 60 },
        calories: { current: todayProgress.caloriesConsumed || 0, goal: 1800 }
      },
      todayWorkout,
      mealPlan,
      upcomingClasses
    };
  }
  
  async getLeaderboard(): Promise<any[]> {
    const users = await this.getUsers();
    const leaderboard = [];
    
    for (const user of users) {
      if (user.role === 'user') {
        // Get user progress
        const recentProgress = await this.getUserProgress(user.id);
        
        // Calculate metrics
        const workouts = recentProgress.filter(p => p.workoutCompleted).length;
        const minutes = recentProgress.reduce((sum, p) => sum + (p.workoutDuration || 0), 0);
        const points = workouts * 50 + minutes;
        
        leaderboard.push({
          id: user.id,
          name: user.fullName,
          city: user.city || 'Unknown',
          workouts,
          minutes,
          points
        });
      }
    }
    
    // Sort by points
    return leaderboard.sort((a, b) => b.points - a.points);
  }
}

export const storage = new MemStorage();
