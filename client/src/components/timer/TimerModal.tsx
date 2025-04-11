import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TimerModal({ isOpen, onClose }: TimerModalProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Set up audio element for timer completion
  useEffect(() => {
    audioRef.current = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3");
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            // Play sound when timer completes
            if (audioRef.current) {
              audioRef.current.play().catch(e => console.error("Audio error:", e));
            }
            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, seconds]);

  // Reset timer when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setIsRunning(false);
      setSeconds(0);
    }
  }, [isOpen]);

  const startTimer = () => {
    if (seconds > 0) {
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  const setTime = (time: number) => {
    setSeconds(time);
    setIsRunning(false);
  };

  const formatTime = () => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Workout Timer</DialogTitle>
          <DialogDescription>
            Set a timer for your workout or rest periods
          </DialogDescription>
        </DialogHeader>
        
        <div className="text-center py-8">
          <div className="text-6xl font-display font-bold mb-6">
            {formatTime()}
          </div>
          
          <div className="flex justify-center space-x-4 mb-6">
            <Button variant="outline" onClick={() => setTime(30)}>30s</Button>
            <Button variant="outline" onClick={() => setTime(60)}>1m</Button>
            <Button variant="outline" onClick={() => setTime(90)}>1m 30s</Button>
            <Button variant="outline" onClick={() => setTime(120)}>2m</Button>
          </div>
        </div>
        
        <DialogFooter className="flex space-x-3">
          {!isRunning ? (
            <Button onClick={startTimer} className="flex-1" disabled={seconds === 0}>
              Start
            </Button>
          ) : (
            <Button onClick={pauseTimer} className="flex-1">
              Pause
            </Button>
          )}
          <Button variant="outline" onClick={resetTimer} className="flex-1">
            Reset
          </Button>
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
