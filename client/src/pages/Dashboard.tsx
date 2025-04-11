import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import UserWelcome from "@/components/dashboard/UserWelcome";
import QuickStats from "@/components/dashboard/QuickStats";
import MealPlan from "@/components/dashboard/MealPlan";
import WorkoutPlan from "@/components/dashboard/WorkoutPlan";
import TrainerMessages from "@/components/dashboard/TrainerMessages";
import ProgressChart from "@/components/dashboard/ProgressChart";
import Leaderboard from "@/components/dashboard/Leaderboard";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <MainLayout>
      <UserWelcome />
      
      <QuickStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-dark">Today's Plan</h3>
              <div className="text-sm bg-gray-100 rounded-lg px-3 py-1">
                <span>{window.formatDate(new Date(), 'MMMM d, yyyy')}</span>
              </div>
            </div>
            
            <MealPlan />
            <WorkoutPlan />
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <TrainerMessages />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProgressChart />
        </div>
        
        <div className="lg:col-span-1">
          <Leaderboard />
        </div>
      </div>
    </MainLayout>
  );
}
