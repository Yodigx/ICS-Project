# FitLife - Interactive Health & Fitness Platform

A comprehensive web application designed to address health and fitness concerns in India, providing tools for workout planning, nutrition management, progress tracking, and trainer communication.

## Features

### Current Features
- **User Authentication**: Secure login and registration system
- **Personalized Dashboard**: Quick overview of fitness stats, upcoming workouts, and nutrition
- **Workout Management**: Browse, start and track workout routines
- **Diet Planning**: Meal suggestions and nutritional information
- **Progress Tracking**: Visualize weight changes and workout consistency over time
- **Community Features**: Leaderboard to track and compare progress with others
- **Trainer Communication**: Message system to connect with fitness trainers
- **Class Scheduling**: Book fitness classes with preferred trainers

### Technical Implementation
- Built with React and TypeScript for a robust frontend
- Express.js backend with RESTful API architecture
- In-memory data storage with structured schemas
- Chart.js integration for data visualization
- Mobile-responsive design using Tailwind CSS and Shadcn components

## Getting Started

### Prerequisites
- Node.js 20.x or higher

### Installation
1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`

### Demo Credentials
- Username: `rahul_sharma`
- Password: `password123`

## Project Roadmap

### Phase 1: Initial Prototype ✓
- Basic user interface with authentication
- Core workout and nutrition tracking features
- In-memory data storage

### Phase 2: Database Integration
- Migrate to persistent storage with PostgreSQL
- User profile management and settings

### Phase 3: Advanced Analytics
- Enhanced progress tracking with detailed metrics
- Customized workout recommendations based on user goals

### Phase 4: Live Session Functionality
- Real-time trainer-led workout sessions
- Video integration for form checking and guidance

### Phase 5: AI-Enhanced Diet Planning
- Personalized meal recommendations based on goals and preferences
- Nutritional analysis of user-input meals

### Phase 6: Mobile App Development
- Native mobile applications for Android and iOS
- Offline workout tracking capability

## Technical Architecture

- **Frontend**: React with TypeScript, Tailwind CSS, Shadcn components
- **Backend**: Express.js with RESTful API endpoints
- **State Management**: React Query for server state, React Context for global state
- **Authentication**: JWT-based authentication system
- **Data Visualization**: Chart.js for progress charts

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - User login

### Workouts
- GET `/api/workouts` - Get all workouts
- GET `/api/workouts/:id` - Get a specific workout
- POST `/api/workouts` - Create a new workout
- GET `/api/workouts/:id/exercises` - Get exercises for a workout
- POST `/api/workouts/recommend` - Get workout recommendations

### Nutrition
- GET `/api/foods` - Get all food items
- GET `/api/foods/:id` - Get a specific food item
- POST `/api/foods` - Add a new food item
- GET `/api/meal-plans/:userId/today` - Get today's meal plan for a user
- POST `/api/meal-plans` - Create a meal plan

### Progress Tracking
- GET `/api/progress/user/:userId` - Get progress data for a user
- POST `/api/progress` - Add new progress data
- GET `/api/workout-logs/user/:userId` - Get workout logs for a user
- POST `/api/workout-logs` - Log a completed workout

### Social Features
- GET `/api/leaderboard` - Get the leaderboard data

### Communication
- GET `/api/messages/user/:userId` - Get messages for a user
- POST `/api/messages` - Send a new message
- PATCH `/api/messages/:id/read` - Mark a message as read

### Classes and Scheduling
- GET `/api/class-schedules` - Get all class schedules
- POST `/api/class-schedules` - Create a new class
- GET `/api/class-enrollments/user/:userId` - Get a user's enrolled classes
- POST `/api/class-enrollments` - Enroll in a class

## License
This project is licensed under the MIT License - see the LICENSE file for details.
