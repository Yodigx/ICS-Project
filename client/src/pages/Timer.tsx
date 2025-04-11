import { useState, useEffect, useRef } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Timer() {
  const [timerMode, setTimerMode] = useState("countdown");
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [intervals, setIntervals] = useState<{ work: number; rest: number; rounds: number }>({
    work: 30,
    rest: 10,
    rounds: 8
  });
  const [currentRound, setCurrentRound] = useState(1);
  const [isWork, setIsWork] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio element
  useEffect(() => {
    audioRef.current = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-simple-countdown-922.mp3");
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle timer logic
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds <= 1) {
            // Play sound when timer completes
            if (audioRef.current) {
              audioRef.current.play().catch(e => console.error("Error playing audio:", e));
            }
            
            if (timerMode === "countdown") {
              clearInterval(intervalRef.current!);
              setIsActive(false);
              return 0;
            } else if (timerMode === "interval") {
              if (isWork) {
                setIsWork(false);
                return intervals.rest;
              } else {
                if (currentRound < intervals.rounds) {
                  setCurrentRound(prevRound => prevRound + 1);
                  setIsWork(true);
                  return intervals.work;
                } else {
                  clearInterval(intervalRef.current!);
                  setIsActive(false);
                  return 0;
                }
              }
            }
          }
          return prevSeconds - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timerMode, isWork, currentRound, intervals]);

  const startTimer = () => {
    if (seconds > 0 || (timerMode === "interval" && (intervals.work > 0 && intervals.rest > 0))) {
      setIsActive(true);
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (timerMode === "countdown") {
      setSeconds(0);
    } else {
      setSeconds(intervals.work);
      setIsWork(true);
      setCurrentRound(1);
    }
  };

  const setTime = (timeInSeconds: number) => {
    if (!isActive) {
      setSeconds(timeInSeconds);
    }
  };

  const handleWorkTimeChange = (value: number[]) => {
    setIntervals(prev => ({ ...prev, work: value[0] }));
    if (!isActive && isWork) {
      setSeconds(value[0]);
    }
  };

  const handleRestTimeChange = (value: number[]) => {
    setIntervals(prev => ({ ...prev, rest: value[0] }));
    if (!isActive && !isWork) {
      setSeconds(value[0]);
    }
  };

  const handleRoundsChange = (value: number[]) => {
    setIntervals(prev => ({ ...prev, rounds: value[0] }));
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (timerMode === "countdown") {
      setIsActive(false);
      setSeconds(0);
    } else if (timerMode === "interval") {
      setIsActive(false);
      setSeconds(intervals.work);
      setIsWork(true);
      setCurrentRound(1);
    }
  }, [timerMode, intervals.work]);

  return (
    <MainLayout title="Workout Timer">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">Workout Timer</CardTitle>
            <CardDescription className="text-center">Track your workout time and intervals</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={timerMode} onValueChange={setTimerMode} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="countdown">Countdown</TabsTrigger>
                <TabsTrigger value="interval">Interval</TabsTrigger>
              </TabsList>
              
              <TabsContent value="countdown" className="space-y-6">
                <div className="text-center py-10">
                  <div className="text-7xl font-display font-bold mb-6 tabular-nums">
                    {formatTime(seconds)}
                  </div>
                  
                  <div className="flex justify-center space-x-4 mb-6">
                    <Button variant="outline" onClick={() => setTime(30)}>30s</Button>
                    <Button variant="outline" onClick={() => setTime(60)}>1m</Button>
                    <Button variant="outline" onClick={() => setTime(90)}>1m 30s</Button>
                    <Button variant="outline" onClick={() => setTime(120)}>2m</Button>
                  </div>
                  
                  <div className="max-w-xs mx-auto mb-6">
                    <Label className="text-center block mb-2">Custom Time (seconds)</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      max="3600" 
                      value={seconds} 
                      onChange={(e) => setTime(parseInt(e.target.value) || 0)}
                      disabled={isActive}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="interval" className="space-y-6">
                <div className="text-center py-10">
                  <div className="mb-2">
                    <span className="text-sm font-medium bg-gray-100 rounded-full px-3 py-1">
                      {isWork ? 'WORK' : 'REST'} • Round {currentRound}/{intervals.rounds}
                    </span>
                  </div>
                  
                  <div className="text-7xl font-display font-bold mb-8 tabular-nums">
                    {formatTime(seconds)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-lg mx-auto">
                    <div className="space-y-2">
                      <Label className="text-center block">Work (seconds)</Label>
                      <div className="flex items-center space-x-2">
                        <Slider 
                          defaultValue={[intervals.work]} 
                          min={5} 
                          max={120} 
                          step={5}
                          onValueChange={handleWorkTimeChange}
                          disabled={isActive}
                        />
                        <span className="w-9 text-center">{intervals.work}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-center block">Rest (seconds)</Label>
                      <div className="flex items-center space-x-2">
                        <Slider 
                          defaultValue={[intervals.rest]} 
                          min={5} 
                          max={60} 
                          step={5}
                          onValueChange={handleRestTimeChange}
                          disabled={isActive}
                        />
                        <span className="w-9 text-center">{intervals.rest}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-center block">Rounds</Label>
                      <div className="flex items-center space-x-2">
                        <Slider 
                          defaultValue={[intervals.rounds]} 
                          min={1} 
                          max={20} 
                          step={1}
                          onValueChange={handleRoundsChange}
                          disabled={isActive}
                        />
                        <span className="w-9 text-center">{intervals.rounds}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center space-x-4">
            {!isActive ? (
              <Button onClick={startTimer} className="w-32">Start</Button>
            ) : (
              <Button onClick={pauseTimer} className="w-32">Pause</Button>
            )}
            <Button variant="outline" onClick={resetTimer} className="w-32">Reset</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Popular Timer Presets</CardTitle>
            <CardDescription>Quick access to common workout timing patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button 
                variant="outline"
                className="h-auto py-4 flex flex-col" 
                onClick={() => {
                  setTimerMode("interval");
                  setIntervals({ work: 20, rest: 10, rounds: 8 });
                  setSeconds(20);
                  setIsWork(true);
                  setCurrentRound(1);
                  setIsActive(false);
                }}
              >
                <span className="font-medium">TABATA</span>
                <span className="text-sm text-gray-500">20s work / 10s rest</span>
                <span className="text-sm text-gray-500">8 rounds</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col"
                onClick={() => {
                  setTimerMode("interval");
                  setIntervals({ work: 40, rest: 20, rounds: 5 });
                  setSeconds(40);
                  setIsWork(true);
                  setCurrentRound(1);
                  setIsActive(false);
                }}
              >
                <span className="font-medium">HIIT</span>
                <span className="text-sm text-gray-500">40s work / 20s rest</span>
                <span className="text-sm text-gray-500">5 rounds</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col"
                onClick={() => {
                  setTimerMode("interval");
                  setIntervals({ work: 60, rest: 30, rounds: 10 });
                  setSeconds(60);
                  setIsWork(true);
                  setCurrentRound(1);
                  setIsActive(false);
                }}
              >
                <span className="font-medium">EMOM</span>
                <span className="text-sm text-gray-500">60s work / 30s rest</span>
                <span className="text-sm text-gray-500">10 rounds</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
