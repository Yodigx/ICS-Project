import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import DietPlanner from "@/pages/DietPlanner";
import Workouts from "@/pages/Workouts";
import Progress from "@/pages/Progress";
import Timer from "@/pages/Timer";
import Leaderboard from "@/pages/Leaderboard";
import Schedule from "@/pages/Schedule";
import Messages from "@/pages/Messages";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { AuthProvider } from "@/hooks/useAuth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/diet-planner" component={DietPlanner} />
      <Route path="/workouts" component={Workouts} />
      <Route path="/progress" component={Progress} />
      <Route path="/timer" component={Timer} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/messages" component={Messages} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
