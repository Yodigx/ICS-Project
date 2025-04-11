import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const linkClass = (path: string) => {
    return `flex items-center px-4 py-3 text-sm rounded-lg ${
      isActive(path) 
        ? 'bg-gray-800 text-white' 
        : 'hover:bg-gray-800 text-gray-300 hover:text-white transition'
    }`;
  };

  const iconClass = (path: string) => {
    return `mr-3 ${isActive(path) ? 'text-primary' : 'text-gray-400'}`;
  };

  return (
    <aside className="bg-dark text-white lg:w-64 w-full lg:flex lg:flex-col hidden lg:fixed lg:inset-y-0">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-primary">FitLife</h1>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        <a href="/" className={linkClass("/")}>
          <i className={`fas fa-home ${iconClass("/")}`}></i>
          <span>Dashboard</span>
        </a>
        <a href="/diet-planner" className={linkClass("/diet-planner")}>
          <i className={`fas fa-utensils ${iconClass("/diet-planner")}`}></i>
          <span>Diet Planner</span>
        </a>
        <a href="/workouts" className={linkClass("/workouts")}>
          <i className={`fas fa-dumbbell ${iconClass("/workouts")}`}></i>
          <span>Workouts</span>
        </a>
        <a href="/progress" className={linkClass("/progress")}>
          <i className={`fas fa-chart-line ${iconClass("/progress")}`}></i>
          <span>Progress</span>
        </a>
        <a href="/timer" className={linkClass("/timer")}>
          <i className={`fas fa-stopwatch ${iconClass("/timer")}`}></i>
          <span>Timer</span>
        </a>
        <a href="/leaderboard" className={linkClass("/leaderboard")}>
          <i className={`fas fa-trophy ${iconClass("/leaderboard")}`}></i>
          <span>Leaderboard</span>
        </a>
        <a href="/schedule" className={linkClass("/schedule")}>
          <i className={`fas fa-calendar-alt ${iconClass("/schedule")}`}></i>
          <span>Schedule</span>
        </a>
        <a href="/messages" className={linkClass("/messages")}>
          <i className={`fas fa-comments ${iconClass("/messages")}`}></i>
          <span>Messages</span>
        </a>
        <a href="/profile" className={linkClass("/profile")}>
          <i className={`fas fa-user ${iconClass("/profile")}`}></i>
          <span>Profile</span>
        </a>
      </nav>

      {user && (
        <div className="p-4 border-t border-gray-700">
          <div className="flex flex-col">
            <div className="flex items-center mb-2">
              <img 
                className="h-10 w-10 rounded-full object-cover" 
                src={user.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"} 
                alt={`${user.firstName} ${user.lastName}`} 
              />
              <div className="ml-3 flex-1 truncate">
                <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-400">{user.plan} Plan</p>
              </div>
            </div>
            <Button 
              onClick={logout}
              variant="outline"
              className="w-full mt-2 text-sm"
              size="sm"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Logout
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
