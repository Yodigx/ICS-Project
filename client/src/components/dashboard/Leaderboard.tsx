import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LeaderboardEntry } from "@/types";

export default function Leaderboard() {
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['/api/leaderboard'],
  });

  const getLeaderboardColors = (position: number) => {
    switch(position) {
      case 0:
        return { bg: "bg-primary", border: "border-primary", text: "text-primary" };
      case 1:
        return { bg: "bg-secondary", border: "border-secondary", text: "text-secondary" };
      case 2:
        return { bg: "bg-accent", border: "border-accent", text: "text-accent" };
      default:
        return { bg: "bg-gray-200", border: "border-gray-300", text: "text-gray-700" };
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-dark">Leaderboard</h3>
          <Skeleton className="h-8 w-32" />
        </div>
        
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
          
          <div className="mt-4 text-center">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-dark">Leaderboard</h3>
        <select className="text-sm bg-gray-100 rounded-lg px-3 py-2 border-none">
          <option>This Week</option>
          <option>This Month</option>
          <option>All Time</option>
        </select>
      </div>
      
      <div className="space-y-4">
        {leaderboardData && leaderboardData.length > 0 ? (
          leaderboardData.slice(0, 4).map((entry: LeaderboardEntry, index: number) => {
            const { bg, border, text } = getLeaderboardColors(index);
            return (
              <div 
                key={entry.user.id} 
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition"
              >
                <div className={`w-8 h-8 rounded-full ${bg} text-white flex items-center justify-center font-bold text-sm mr-3`}>
                  {index + 1}
                </div>
                <Avatar className={`h-10 w-10 border-2 ${border}`}>
                  <AvatarImage 
                    src={entry.user.profileImage} 
                    alt={`${entry.user.firstName} ${entry.user.lastName}`}
                  />
                  <AvatarFallback>
                    {getInitials(entry.user.firstName, entry.user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">
                    {entry.user.firstName} {entry.user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {entry.user.workoutLogs?.length || 0} workouts completed
                  </p>
                </div>
                <div className={`text-sm font-display font-semibold ${text}`}>
                  {entry.points} pts
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center p-6">
            <p className="text-gray-500">No leaderboard data available.</p>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <Link href="/leaderboard">
            <button className="w-full bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
              View Full Leaderboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
