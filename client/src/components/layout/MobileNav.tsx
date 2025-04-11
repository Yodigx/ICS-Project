import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

export default function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout } = useAuth();
  const [location] = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location === path;
  };

  const linkClass = (path: string) => {
    return `block px-4 py-2 text-sm rounded-lg ${
      isActive(path) 
        ? 'bg-gray-800 text-white' 
        : 'hover:bg-gray-800 text-gray-300 hover:text-white'
    }`;
  };

  const iconClass = (path: string) => {
    return `mr-3 ${isActive(path) ? 'text-primary' : 'text-gray-400'}`;
  };

  return (
    <>
      <div className="lg:hidden bg-dark text-white w-full py-4 px-6 flex items-center justify-between z-40">
        <h1 className="text-xl font-bold text-primary">FitLife</h1>
        <button onClick={toggleMenu} className="text-white">
          <i className="fas fa-bars text-xl"></i>
        </button>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMenu} />
      )}

      <div className={`lg:hidden fixed top-14 inset-x-0 bg-dark text-white z-50 transform ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'} transition-transform duration-200 ease-in-out`}>
        <nav className="px-4 py-2 space-y-1">
          <Link href="/">
            <a className={linkClass("/")} onClick={() => setIsMenuOpen(false)}>
              <i className={`fas fa-home ${iconClass("/")}`}></i>
              <span>Dashboard</span>
            </a>
          </Link>
          <Link href="/diet-planner">
            <a className={linkClass("/diet-planner")} onClick={() => setIsMenuOpen(false)}>
              <i className={`fas fa-utensils ${iconClass("/diet-planner")}`}></i>
              <span>Diet Planner</span>
            </a>
          </Link>
          <Link href="/workouts">
            <a className={linkClass("/workouts")} onClick={() => setIsMenuOpen(false)}>
              <i className={`fas fa-dumbbell ${iconClass("/workouts")}`}></i>
              <span>Workouts</span>
            </a>
          </Link>
          <Link href="/progress">
            <a className={linkClass("/progress")} onClick={() => setIsMenuOpen(false)}>
              <i className={`fas fa-chart-line ${iconClass("/progress")}`}></i>
              <span>Progress</span>
            </a>
          </Link>
          <Link href="/timer">
            <a className={linkClass("/timer")} onClick={() => setIsMenuOpen(false)}>
              <i className={`fas fa-stopwatch ${iconClass("/timer")}`}></i>
              <span>Timer</span>
            </a>
          </Link>
          <Link href="/leaderboard">
            <a className={linkClass("/leaderboard")} onClick={() => setIsMenuOpen(false)}>
              <i className={`fas fa-trophy ${iconClass("/leaderboard")}`}></i>
              <span>Leaderboard</span>
            </a>
          </Link>
          <Link href="/schedule">
            <a className={linkClass("/schedule")} onClick={() => setIsMenuOpen(false)}>
              <i className={`fas fa-calendar-alt ${iconClass("/schedule")}`}></i>
              <span>Schedule</span>
            </a>
          </Link>
          <Link href="/messages">
            <a className={linkClass("/messages")} onClick={() => setIsMenuOpen(false)}>
              <i className={`fas fa-comments ${iconClass("/messages")}`}></i>
              <span>Messages</span>
            </a>
          </Link>
          <button 
            onClick={() => {
              logout();
              setIsMenuOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white"
          >
            <i className="fas fa-sign-out-alt mr-3 text-gray-400"></i>
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </>
  );
}
