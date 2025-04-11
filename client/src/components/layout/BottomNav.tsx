import { useLocation, Link } from 'wouter';

export default function BottomNav() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const iconClass = (path: string) => {
    return isActive(path) ? 'text-primary' : 'text-gray-400';
  };

  const textClass = (path: string) => {
    return isActive(path) ? 'text-primary text-xs' : 'text-gray-400 text-xs';
  };

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 lg:hidden z-40">
      <div className="grid grid-cols-5 h-16">
        <Link href="/">
          <a className="flex flex-col items-center justify-center">
            <i className={`fas fa-home text-lg ${iconClass('/')}`}></i>
            <span className={textClass('/')}>Home</span>
          </a>
        </Link>
        <Link href="/workouts">
          <a className="flex flex-col items-center justify-center">
            <i className={`fas fa-dumbbell text-lg ${iconClass('/workouts')}`}></i>
            <span className={textClass('/workouts')}>Workouts</span>
          </a>
        </Link>
        <Link href="/diet-planner">
          <a className="flex flex-col items-center justify-center">
            <i className={`fas fa-utensils text-lg ${iconClass('/diet-planner')}`}></i>
            <span className={textClass('/diet-planner')}>Diet</span>
          </a>
        </Link>
        <Link href="/progress">
          <a className="flex flex-col items-center justify-center">
            <i className={`fas fa-chart-line text-lg ${iconClass('/progress')}`}></i>
            <span className={textClass('/progress')}>Progress</span>
          </a>
        </Link>
        <Link href="/profile">
          <a className="flex flex-col items-center justify-center">
            <i className={`fas fa-user text-lg ${iconClass('/profile')}`}></i>
            <span className={textClass('/profile')}>Profile</span>
          </a>
        </Link>
      </div>
    </div>
  );
}