import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Chart from "chart.js/auto";

interface DataPoint {
  day: string;
  workoutDuration: number;
  caloriesBurned: number;
}

interface WeeklyActivityChartProps {
  data: DataPoint[];
}

export function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [period, setPeriod] = React.useState<"week" | "month">("week");

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      
      if (ctx) {
        // Destroy previous chart if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
        
        chartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: data.map(item => item.day),
            datasets: [
              {
                label: "Workouts (mins)",
                data: data.map(item => item.workoutDuration),
                backgroundColor: "#3B82F6",
                borderRadius: 8,
                barThickness: 16
              },
              {
                label: "Calories Burned",
                data: data.map(item => item.caloriesBurned),
                backgroundColor: "#10B981",
                borderRadius: 8,
                barThickness: 16
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  display: true,
                  color: "#f3f4f6"
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            },
            plugins: {
              legend: {
                position: "bottom"
              }
            }
          }
        });
      }
    }
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, period]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Weekly Activity</CardTitle>
          <div className="flex space-x-2">
            <Button
              variant={period === "week" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-full text-xs h-8 px-3"
              onClick={() => setPeriod("week")}
            >
              Week
            </Button>
            <Button
              variant={period === "month" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-full text-xs h-8 px-3"
              onClick={() => setPeriod("month")}
            >
              Month
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
}
