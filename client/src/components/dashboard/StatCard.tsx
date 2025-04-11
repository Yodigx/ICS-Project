import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Timer, Droplet, Clock } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: "calories" | "streak" | "water" | "session";
  change?: {
    value: string;
    positive: boolean;
    text: string;
  };
  additionalText?: string;
}

export function StatCard({ title, value, icon, change, additionalText }: StatCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "calories":
        return <Flame className="h-5 w-5" />;
      case "streak":
        return <Timer className="h-5 w-5" />;
      case "water":
        return <Droplet className="h-5 w-5" />;
      case "session":
        return <Clock className="h-5 w-5" />;
      default:
        return <Flame className="h-5 w-5" />;
    }
  };

  const getIconColor = () => {
    switch (icon) {
      case "calories":
      case "session":
        return "bg-blue-100 text-primary";
      case "streak":
        return "bg-green-100 text-green-600";
      case "water":
        return "bg-blue-100 text-blue-500";
      default:
        return "bg-blue-100 text-primary";
    }
  };

  return (
    <Card className="shadow-sm border border-gray-100">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
          </div>
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", getIconColor())}>
            {getIcon()}
          </div>
        </div>
        <div className="mt-2 text-xs">
          {change && (
            <>
              <span className={cn("font-medium", change.positive ? "text-green-600" : "text-red-500")}>
                {change.positive ? "↑ " : "↓ "}{change.value}
              </span>
              <span className="text-gray-500 ml-1">{change.text}</span>
            </>
          )}
          {additionalText && (
            <span className="text-gray-700">{additionalText}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
