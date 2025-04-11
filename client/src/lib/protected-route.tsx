import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Small delay to let the authentication check complete
    const checkAuth = async () => {
      if (!isAuthenticated && !user) {
        // Redirect to the authentication page that exists in our routes
        setLocation("/register");
      }
      setIsChecking(false);
    };
    
    // Add a small timeout to ensure the auth state is properly loaded
    const timer = setTimeout(checkAuth, 300);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, setLocation]);

  // While checking authentication, show loading
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If after check we're not authenticated, still return loading
  // (the redirect will happen via the useEffect)
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}