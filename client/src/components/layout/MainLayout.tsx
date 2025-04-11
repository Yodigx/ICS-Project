import { ReactNode, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { useAuth } from '@/hooks/useAuth';
import { useLocation, Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function MainLayout({ children, title }: MainLayoutProps) {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Skeleton className="hidden lg:block lg:w-64 h-screen" />
        <div className="flex-1 lg:ml-64">
          <Skeleton className="h-16 w-full block lg:hidden" />
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-10 w-64 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Skeleton className="h-96 w-full lg:col-span-2 rounded-xl" />
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      <Sidebar />
      <MobileNav />
      
      <main className="flex-1 lg:ml-64">
        <div className="container mx-auto px-4 py-8 pb-20 lg:pb-8">
          {title && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-dark">{title}</h2>
            </div>
          )}
          {children}
        </div>
      </main>
      
      {/* Mobile bottom navigation - fixed at bottom of viewport */}
      <div className="lg:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 z-30">
        <div className="flex justify-around">
          <Link href="/">
            <a className="flex flex-col items-center py-3 px-2 text-primary">
              <i className="fas fa-home text-xl"></i>
              <span className="text-xs mt-1">Home</span>
            </a>
          </Link>
          <Link href="/diet-planner">
            <a className="flex flex-col items-center py-3 px-2 text-gray-500">
              <i className="fas fa-utensils text-xl"></i>
              <span className="text-xs mt-1">Diet</span>
            </a>
          </Link>
          <Link href="/workouts">
            <a className="flex flex-col items-center py-3 px-2 text-gray-500">
              <i className="fas fa-dumbbell text-xl"></i>
              <span className="text-xs mt-1">Workout</span>
            </a>
          </Link>
          <Link href="/progress">
            <a className="flex flex-col items-center py-3 px-2 text-gray-500">
              <i className="fas fa-chart-line text-xl"></i>
              <span className="text-xs mt-1">Progress</span>
            </a>
          </Link>
          <Link href="/profile">
            <a className="flex flex-col items-center py-3 px-2 text-gray-500">
              <i className="fas fa-user text-xl"></i>
              <span className="text-xs mt-1">Profile</span>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
