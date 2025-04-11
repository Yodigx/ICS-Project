import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MacroProps {
  type: "protein" | "carbs" | "fats";
  percentage: number;
  current: number;
  goal: number;
}

interface NutritionBreakdownProps {
  protein: { current: number; goal: number };
  carbs: { current: number; goal: number };
  fats: { current: number; goal: number };
  calories: { current: number; goal: number };
}

const MacroCircle: React.FC<MacroProps> = ({ type, percentage, current, goal }) => {
  const getColor = () => {
    switch (type) {
      case "protein":
        return "border-primary text-primary";
      case "carbs":
        return "border-green-500 text-green-500";
      case "fats":
        return "border-amber-500 text-amber-500";
      default:
        return "border-primary text-primary";
    }
  };

  const getLabel = () => {
    switch (type) {
      case "protein":
        return "Protein";
      case "carbs":
        return "Carbs";
      case "fats":
        return "Fats";
      default:
        return "";
    }
  };

  return (
    <div className="text-center">
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-4 relative ${getColor()}`}>
        <span className="text-lg font-bold">{percentage}%</span>
      </div>
      <p className="mt-2 text-sm font-medium">{getLabel()}</p>
      <p className="text-xs text-gray-500">{current}g / {goal}g</p>
    </div>
  );
};

export function NutritionBreakdown({ protein, carbs, fats, calories }: NutritionBreakdownProps) {
  const proteinPercentage = Math.round((protein.current / protein.goal) * 100);
  const carbsPercentage = Math.round((carbs.current / carbs.goal) * 100);
  const fatsPercentage = Math.round((fats.current / fats.goal) * 100);
  const caloriesPercentage = Math.round((calories.current / calories.goal) * 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Nutrition Breakdown</CardTitle>
          <div className="text-xs text-gray-500">Today</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <MacroCircle
            type="protein"
            percentage={proteinPercentage}
            current={protein.current}
            goal={protein.goal}
          />
          <MacroCircle
            type="carbs"
            percentage={carbsPercentage}
            current={carbs.current}
            goal={carbs.goal}
          />
          <MacroCircle
            type="fats"
            percentage={fatsPercentage}
            current={fats.current}
            goal={fats.goal}
          />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Daily Calorie Goal</span>
            <span>{calories.current} / {calories.goal} kcal</span>
          </div>
          <Progress value={caloriesPercentage} className="h-2.5" />
        </div>
      </CardContent>
    </Card>
  );
}
