import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProgressData, WorkoutLog } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Chart } from "chart.js/auto";

export default function ProgressChart() {
  const { user } = useAuth();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [timeRange, setTimeRange] = useState<string>("30");

  // Fetch progress data
  const { data: progressData, isLoading: isLoadingProgress } = useQuery<ProgressData[]>({
    queryKey: ['/api/progress/user/' + (user?.id || 0)],
    enabled: !!user?.id,
  });

  // Fetch workout logs
  const { data: workoutLogs, isLoading: isLoadingWorkouts } = useQuery<WorkoutLog[]>({
    queryKey: ['/api/workout-logs/user/' + (user?.id || 0)],
    enabled: !!user?.id,
  });

  const isLoading = isLoadingProgress || isLoadingWorkouts;

  // Initialize chart when data is loaded or timeRange changes
  useEffect(() => {
    if (isLoading || !chartRef.current) return;

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Format the data based on the selected time range
    const days = parseInt(timeRange);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Filter progress data within the selected date range
    const filteredProgressData = progressData?.filter((data: ProgressData) => {
      const dataDate = new Date(data.date);
      return dataDate >= startDate && dataDate <= endDate;
    }) || [];

    // Filter workout logs within the selected date range
    const filteredWorkoutLogs = workoutLogs?.filter((log: WorkoutLog) => {
      const logDate = new Date(log.date);
      return logDate >= startDate && logDate <= endDate;
    }) || [];

    // Group workout logs by date
    const workoutsByDate: { [key: string]: number } = {};
    filteredWorkoutLogs.forEach((log: WorkoutLog) => {
      const dateStr = new Date(log.date).toISOString().split('T')[0];
      workoutsByDate[dateStr] = (workoutsByDate[dateStr] || 0) + 1;
    });

    // Prepare data for chart
    const dateLabels: string[] = [];
    const weightData: (number | null)[] = [];
    const workoutData: number[] = [];

    // Create date labels for the chart (e.g., "Apr 15", "Apr 22", etc.)
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const formattedDate = window.formatDate(currentDate, 'MMM d');
      
      dateLabels.push(formattedDate);
      
      // Find progress data for this date
      const progress = filteredProgressData.find((data: ProgressData) => 
        new Date(data.date).toISOString().split('T')[0] === dateStr
      );
      
      weightData.push(progress?.weight || null);
      workoutData.push(workoutsByDate[dateStr] || 0);
      
      // Move to next date
      currentDate.setDate(currentDate.getDate() + Math.ceil(days / 5));
    }

    // Create the chart
    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: dateLabels,
        datasets: [
          {
            label: 'Workouts',
            data: workoutData,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Weight (kg)',
            data: weightData,
            borderColor: '#F97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            tension: 0.3,
            fill: true,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Workouts'
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y1: {
            position: 'right',
            beginAtZero: false,
            title: {
              display: true,
              text: 'Weight (kg)'
            },
            grid: {
              display: false
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
            position: 'top'
          }
        },
        responsive: true,
        maintainAspectRatio: false
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [progressData, workoutLogs, timeRange, isLoading]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-dark">Fitness Progress</h3>
          <Skeleton className="h-8 w-32 rounded" />
        </div>
        
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-dark">Fitness Progress</h3>
        <select 
          className="text-sm bg-gray-100 rounded-lg px-3 py-2 border-none"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="30">Last 30 Days</option>
          <option value="90">Last 3 Months</option>
          <option value="180">Last 6 Months</option>
        </select>
      </div>
      
      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
