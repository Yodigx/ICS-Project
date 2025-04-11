import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Food, MealPlan } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function MealPlanComponent() {
  const { user } = useAuth();
  
  const { data: mealPlan, isLoading: isLoadingMealPlan } = useQuery({
    queryKey: ['/api/meal-plans/' + (user?.id || 0) + '/today'],
    enabled: !!user?.id,
  });

  const { data: foods, isLoading: isLoadingFoods } = useQuery({
    queryKey: ['/api/foods'],
    enabled: !!user?.id,
  });

  const isLoading = isLoadingMealPlan || isLoadingFoods;

  const getFoodById = (id: number): Food | undefined => {
    return foods?.find((food: Food) => food.id === id);
  };

  // Map meal type to icon and color
  const getMealTypeStyles = (type: string) => {
    switch (type) {
      case 'breakfast':
        return { icon: 'fa-coffee', bgClass: 'bg-blue-100', textClass: 'text-secondary' };
      case 'lunch':
        return { icon: 'fa-utensils', bgClass: 'bg-orange-100', textClass: 'text-orange-500' };
      case 'dinner':
        return { icon: 'fa-moon', bgClass: 'bg-purple-100', textClass: 'text-purple-500' };
      case 'snack':
        return { icon: 'fa-apple-alt', bgClass: 'bg-green-100', textClass: 'text-success' };
      default:
        return { icon: 'fa-utensils', bgClass: 'bg-gray-100', textClass: 'text-gray-500' };
    }
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-500 mb-4">MEAL PLAN</h4>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full mb-2 rounded-lg" />
        ))}
      </div>
    );
  }

  // Handle case where meal plan is not found
  if (!mealPlan || !mealPlan.meals || mealPlan.meals.length === 0) {
    return (
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-500 mb-4">MEAL PLAN</h4>
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-500">No meal plan available for today.</p>
          <button className="mt-2 text-sm text-primary font-medium">
            Create Meal Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-gray-500 mb-4">MEAL PLAN</h4>
      
      {mealPlan.meals.sort((a: any, b: any) => {
        // Sort by time (assuming time is in HH:MM AM/PM format)
        return new Date('1970/01/01 ' + a.time) - new Date('1970/01/01 ' + b.time);
      }).map((meal: any, index: number) => {
        const food = getFoodById(meal.foodId);
        const { icon, bgClass, textClass } = getMealTypeStyles(meal.type);
        
        return (
          <div key={index} className="flex items-center p-3 hover:bg-gray-50 rounded-lg mb-2 transition">
            <div className={`p-2 ${bgClass} rounded-lg mr-4`}>
              <i className={`fas ${icon} ${textClass}`}></i>
            </div>
            <div className="flex-1">
              <h5 className="text-sm font-medium capitalize">{meal.type}</h5>
              <p className="text-xs text-gray-500">{food?.name || 'Unknown Food'}</p>
            </div>
            <div className="text-xs font-medium text-gray-500 bg-gray-100 py-1 px-2 rounded">
              {meal.time}
            </div>
          </div>
        );
      })}
    </div>
  );
}
