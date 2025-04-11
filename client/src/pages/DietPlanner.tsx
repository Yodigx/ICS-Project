import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/hooks/useAuth";
import { Food } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function DietPlanner() {
  const { user } = useAuth();
  const [goal, setGoal] = useState<string>("weight_loss");
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [calorieTarget, setCalorieTarget] = useState<number>(2000);
  
  const { data: foods, isLoading } = useQuery({
    queryKey: ['/api/foods'],
    enabled: !!user,
  });

  const handleRestrictionToggle = (restriction: string) => {
    setRestrictions(prev => 
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  const getFoodsByCategory = (category: string): Food[] => {
    if (!foods) return [];
    return foods.filter((food: Food) => food.category === category);
  };

  return (
    <MainLayout title="Diet Planner">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Diet Preferences</CardTitle>
              <CardDescription>Customize your meal plan based on your goals and dietary needs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal">Fitness Goal</Label>
                <Select defaultValue={goal} onValueChange={setGoal}>
                  <SelectTrigger id="goal">
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight_loss">Weight Loss</SelectItem>
                    <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="fitness">General Fitness</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Dietary Restrictions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Low-Carb", "Keto"].map(restriction => (
                    <Button
                      key={restriction}
                      variant={restrictions.includes(restriction) ? "default" : "outline"}
                      onClick={() => handleRestrictionToggle(restriction)}
                      className="justify-start"
                    >
                      <span className={restrictions.includes(restriction) ? "text-white" : ""}>{restriction}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="calories">Daily Calorie Target</Label>
                  <span className="text-sm font-medium">{calorieTarget} kcal</span>
                </div>
                <Slider
                  id="calories"
                  min={1200}
                  max={3500}
                  step={50}
                  value={[calorieTarget]}
                  onValueChange={(values) => setCalorieTarget(values[0])}
                />
              </div>

              <Button className="w-full">Generate Meal Plan</Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Meals</CardTitle>
              <CardDescription>Based on your preferences and nutritional needs</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="breakfast">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
                  <TabsTrigger value="lunch">Lunch</TabsTrigger>
                  <TabsTrigger value="dinner">Dinner</TabsTrigger>
                  <TabsTrigger value="snacks">Snacks</TabsTrigger>
                </TabsList>
                
                {["breakfast", "lunch", "dinner", "snacks"].map(mealType => (
                  <TabsContent key={mealType} value={mealType} className="space-y-4">
                    {isLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-24 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {getFoodsByCategory(mealType).length > 0 ? (
                          getFoodsByCategory(mealType).map((food: Food) => (
                            <div key={food.id} className="flex items-center p-3 bg-white border rounded-lg hover:border-primary transition">
                              <div className="p-2 bg-primary bg-opacity-10 rounded-lg mr-4">
                                <i className="fas fa-utensils text-primary"></i>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-medium">{food.name}</h4>
                                <p className="text-xs text-gray-500">
                                  {food.calories} kcal | P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                                </p>
                              </div>
                              <Button variant="ghost" size="sm">
                                <i className="fas fa-plus mr-1"></i> Add
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center p-6 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">No {mealType} options available.</p>
                            <Button variant="link" className="mt-2">
                              Add custom meal
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
