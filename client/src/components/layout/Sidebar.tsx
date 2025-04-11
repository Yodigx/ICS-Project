import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Dumbbell,
  UtensilsCrossed,
  Calendar,
  Trophy,
  MessageSquare,
  Settings,
  LogOut
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "/workouts", label: "Workouts", icon: <Dumbbell className="w-5 h-5" /> },
    { href: "/nutrition", label: "Nutrition", icon: <UtensilsCrossed className="w-5 h-5" /> },
    { href: "/schedule", label: "Schedule", icon: <Calendar className="w-5 h-5" /> },
    { href: "/achievements", label: "Achievements", icon: <Trophy className="w-5 h-5" /> },
    { href: "/messages", label: "Messages", icon: <MessageSquare className="w-5 h-5" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className={cn("hidden lg:block w-64 border-r border-gray-200 bg-white h-screen sticky top-0", className)}>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white">
            <span className="font-bold text-lg">FL</span>
          </div>
          <h1 className="ml-2 text-xl font-bold text-primary">FitLife</h1>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100",
                  location === item.href && "text-primary bg-blue-50"
                )}
              >
                <span className="w-6">{item.icon}</span>
                <span className="ml-3">{item.label}</span>
              </a>
            </Link>
          ))}
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <span className="w-6"><LogOut className="w-5 h-5" /></span>
            <span className="ml-3">Logout</span>
          </button>
        </nav>
      </div>
      
      {user && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center p-2 rounded-lg bg-gray-100">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://avatar.vercel.sh/${user.username}`} alt={user.fullName} />
              <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">{user.fullName}</p>
              <p className="text-xs text-gray-500">{user.role === "trainer" ? "Trainer" : "Member"}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
