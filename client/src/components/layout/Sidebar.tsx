import { useLocation, Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

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
    <aside className="bg-gray-900 text-white lg:w-64 w-full lg:flex lg:flex-col hidden lg:fixed lg:inset-y-0">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-primary">FitLife</h1>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        <Link href="/" className={linkClass("/")}>
          <i className={`fas fa-home ${iconClass("/")}`}></i>
          <span>Dashboard</span>
        </Link>
        <Link href="/diet-planner" className={linkClass("/diet-planner")}>
          <i className={`fas fa-utensils ${iconClass("/diet-planner")}`}></i>
          <span>Diet Planner</span>
        </Link>
        <Link href="/workouts" className={linkClass("/workouts")}>
          <i className={`fas fa-dumbbell ${iconClass("/workouts")}`}></i>
          <span>Workouts</span>
        </Link>
        <Link href="/progress" className={linkClass("/progress")}>
          <i className={`fas fa-chart-line ${iconClass("/progress")}`}></i>
          <span>Progress</span>
        </Link>
        <Link href="/timer" className={linkClass("/timer")}>
          <i className={`fas fa-stopwatch ${iconClass("/timer")}`}></i>
          <span>Timer</span>
        </Link>
        <Link href="/leaderboard" className={linkClass("/leaderboard")}>
          <i className={`fas fa-trophy ${iconClass("/leaderboard")}`}></i>
          <span>Leaderboard</span>
        </Link>
        <Link href="/schedule" className={linkClass("/schedule")}>
          <i className={`fas fa-calendar-alt ${iconClass("/schedule")}`}></i>
          <span>Schedule</span>
        </Link>
        <Link href="/messages" className={linkClass("/messages")}>
          <i className={`fas fa-comments ${iconClass("/messages")}`}></i>
          <span>Messages</span>
        </Link>
        <Link href="/profile" className={linkClass("/profile")}>
          <i className={`fas fa-user ${iconClass("/profile")}`}></i>
          <span>Profile</span>
        </Link>
      </nav>

      {user && (
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
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
        </div>
      )}
    </aside>
  );
}
