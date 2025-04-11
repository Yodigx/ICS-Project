import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { QuickStat } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const calculateProgress = (current: number, target: number): number => {
  return Math.min(100, Math.round((current / target) * 100));
};

export default function QuickStats() {
  const { user } = useAuth();
  
  const { data: workoutLogs, isLoading: isLoadingWorkouts } = useQuery({
    queryKey: ['/api/workout-logs/user/' + (user?.id || 0)],
    enabled: !!user?.id,
  });

  const { data: progressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['/api/progress/user/' + (user?.id || 0)],
    enabled: !!user?.id,
  });

  const { data: mealPlan, isLoading: isLoadingMealPlan } = useQuery({
    queryKey: ['/api/meal-plans/' + (user?.id || 0) + '/today'],
    enabled: !!user?.id,
  });
  
  const isLoading = isLoadingWorkouts || isLoadingProgress || isLoadingMealPlan;

  // Calculate weekly workouts
  const getWeeklyWorkouts = () => {
    if (!workoutLogs) return { count: 0, target: 5 };
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyLogs = workoutLogs.filter((log: any) => 
      new Date(log.date) >= oneWeekAgo && log.completed
    );
    
    return { count: weeklyLogs.length, target: 5 };
  };

  // Calculate daily calories
  const getDailyCalories = () => {
    if (!mealPlan) return { current: 0, target: 2200 };
    
    // Calculate total calories from meal plan
    let totalCalories = 0;
    
    // In a real app, you would fetch the actual food details for each meal
    // For this demo, we'll use a placeholder value
    totalCalories = 1842;
    
    return { current: totalCalories, target: 2200 };
  };

  // Calculate streak
  const getStreak = () => {
    if (!workoutLogs) return { days: 0, target: 30 };
    
    // In a real app, you would calculate the actual streak
    // For this demo, we'll use a placeholder value
    return { days: 12, target: 30 };
  };

  // Calculate protein intake
  const getProteinIntake = () => {
    if (!mealPlan) return { grams: 0, target: 120 };
    
    // In a real app, you would calculate the actual protein intake
    // For this demo, we'll use a placeholder value
    return { grams: 68, target: 120 };
  };

  const statsData: QuickStat[] = [
    {
      title: "Daily Calories",
      value: `${getDailyCalories().current.toLocaleString()}`,
      target: `/ ${getDailyCalories().target}`,
      icon: "fa-fire",
      iconBgClass: "bg-blue-100",
      iconColor: "text-secondary",
      progress: calculateProgress(getDailyCalories().current, getDailyCalories().target),
      progressColor: "bg-secondary"
    },
    {
      title: "Workouts",
      value: `${getWeeklyWorkouts().count}`,
      target: "this week",
      icon: "fa-dumbbell",
      iconBgClass: "bg-green-100",
      iconColor: "text-success",
      progress: calculateProgress(getWeeklyWorkouts().count, getWeeklyWorkouts().target),
      progressColor: "bg-success"
    },
    {
      title: "Protein",
      value: `${getProteinIntake().grams}g`,
      target: `/ ${getProteinIntake().target}g`,
      icon: "fa-apple-alt",
      iconBgClass: "bg-purple-100",
      iconColor: "text-purple-500",
      progress: calculateProgress(getProteinIntake().grams, getProteinIntake().target),
      progressColor: "bg-purple-500"
    },
    {
      title: "Streak",
      value: `${getStreak().days}`,
      target: "days",
      icon: "fa-trophy",
      iconBgClass: "bg-orange-100",
      iconColor: "text-accent",
      progress: calculateProgress(getStreak().days, getStreak().target),
      progressColor: "bg-accent"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statsData.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${stat.iconBgClass} ${stat.iconColor}`}>
              <i className={`fas ${stat.icon} text-xl`}></i>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <div className="flex items-end">
                <p className="text-2xl font-display font-semibold">{stat.value}</p>
                <p className="text-sm text-gray-500 ml-1 mb-1">{stat.target}</p>
              </div>
            </div>
          </div>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`${stat.progressColor} h-full rounded-full`} style={{ width: `${stat.progress}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}
