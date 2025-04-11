import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Dumbbell,
  UtensilsCrossed,
  Trophy,
  User,
  Menu,
  X,
  Calendar,
  MessageSquare,
  Settings,
  LogOut
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";

export function MobileNav() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      logout();
      closeMenu();
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

  const bottomNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="text-xl" /> },
    { href: "/workouts", label: "Workouts", icon: <Dumbbell className="text-xl" /> },
    { href: "/nutrition", label: "Nutrition", icon: <UtensilsCrossed className="text-xl" /> },
    { href: "/achievements", label: "Progress", icon: <Trophy className="text-xl" /> },
    { href: "/settings", label: "Profile", icon: <User className="text-xl" /> }
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white">
            <span className="font-bold text-lg">FL</span>
          </div>
          <h1 className="ml-2 text-xl font-bold text-primary">FitLife</h1>
        </div>
        <button
          onClick={toggleMenu}
          className="text-gray-500 hover:text-primary"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Mobile Sidebar Menu */}
      <div className={cn(
        "fixed inset-0 bg-gray-900/50 z-50 lg:hidden transition-opacity",
        isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div 
          className={cn(
            "bg-white h-full w-64 p-4 transform transition-transform",
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white">
                <span className="font-bold text-lg">FL</span>
              </div>
              <h1 className="ml-2 text-xl font-bold text-primary">FitLife</h1>
            </div>
            <button onClick={closeMenu} className="text-gray-500 hover:text-primary">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100",
                    location === item.href && "text-primary bg-blue-50"
                  )}
                  onClick={closeMenu}
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
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-200 flex justify-around py-3 z-10">
        {bottomNavItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a className={cn(
              "flex flex-col items-center",
              location === item.href ? "text-primary" : "text-gray-500"
            )}>
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </>
  );
}
