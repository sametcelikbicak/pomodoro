import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}


function App() {
  const [workMinutes, setWorkMinutes] = useState<number>(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState<number>(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState<number>(15);
  const [cyclesBeforeLongBreak, setCyclesBeforeLongBreak] = useState<number>(4);
  const [isRunning, setIsRunning] = useState(false);
  const [isWork, setIsWork] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(workMinutes * 60);
  const [isLongBreak, setIsLongBreak] = useState(false);
  const [rounds, setRounds] = useState(0);
  const [autoStartBreak, setAutoStartBreak] = useState(false);

  // keep secondsLeft in sync when durations change and timer not running
  useEffect(() => {
    if (!isRunning) {
      // reset seconds to the appropriate duration when not running
      setSecondsLeft(isWork ? workMinutes * 60 : (isLongBreak ? longBreakMinutes * 60 : shortBreakMinutes * 60));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workMinutes, shortBreakMinutes, longBreakMinutes, isWork, isLongBreak]);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  // when time hits zero swap modes
  useEffect(() => {
    if (secondsLeft > 0) return;
    // finished session
    setIsRunning(false);
    if (isWork) {
      // just finished a work session
      setRounds((r) => {
        const newRounds = r + 1;
        const useLong = cyclesBeforeLongBreak > 0 && newRounds % cyclesBeforeLongBreak === 0;
        setIsWork(false);
        setIsLongBreak(useLong);
        setSecondsLeft((useLong ? longBreakMinutes : shortBreakMinutes) * 60);
        if (autoStartBreak) setIsRunning(true);
        return newRounds;
      });
    } else {
      // finished a break
      setIsWork(true);
      setIsLongBreak(false);
      setSecondsLeft(workMinutes * 60);
      // do not auto-start work by default
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, cyclesBeforeLongBreak, shortBreakMinutes, longBreakMinutes]);

  const total = (isWork ? workMinutes * 60 : (isLongBreak ? longBreakMinutes * 60 : shortBreakMinutes * 60)) || 1;
  const progress = Math.max(0, Math.min(100, Math.round((1 - secondsLeft / total) * 100)));

  function startPause() {
    setIsRunning((r) => !r);
  }

  function reset() {
    setIsRunning(false);
    setIsWork(true);
    setSecondsLeft(workMinutes * 60);
    setRounds(0);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-[420px]">
        <CardHeader>
          <div>
            <CardTitle>Pomodoro</CardTitle>
            <CardDescription>{isWork ? "Focus time" : "Break time"}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">Auto-break</div>
            <Switch
              checked={autoStartBreak}
              onCheckedChange={(v) => setAutoStartBreak(Boolean(v))}
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl font-mono">{formatTime(Math.max(0, secondsLeft))}</div>
            <div className="w-full">
              <Progress value={progress} />
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
              <div className="col-span-1">
                <label className="text-xs text-muted-foreground">Work (min)</label>
                <Input
                  type="number"
                  value={workMinutes}
                  onChange={(e) => setWorkMinutes(Math.max(1, Number(e.target.value) || 1))}
                  className="mt-1"
                />
              </div>
              <div className="col-span-1">
                <label className="text-xs text-muted-foreground">Short break (min)</label>
                <Input
                  type="number"
                  value={shortBreakMinutes}
                  onChange={(e) => setShortBreakMinutes(Math.max(1, Number(e.target.value) || 1))}
                  className="mt-1"
                />
              </div>
              <div className="col-span-1">
                <label className="text-xs text-muted-foreground">Long break (min)</label>
                <Input
                  type="number"
                  value={longBreakMinutes}
                  onChange={(e) => setLongBreakMinutes(Math.max(1, Number(e.target.value) || 1))}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="w-full mt-2">
              <label className="text-xs text-muted-foreground">Cycles before long break</label>
              <Input
                type="number"
                value={cyclesBeforeLongBreak}
                onChange={(e) => setCyclesBeforeLongBreak(Math.max(1, Number(e.target.value) || 1))}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex items-center gap-2 w-full">
            <Button onClick={startPause} className="flex-1">
              {isRunning ? (
                <>
                  Pause
                </>
              ) : (
                <>
                  Start
                </>
              )}
            </Button>
            <Button variant="outline" onClick={reset}>
              Reset
            </Button>
          </div>
        </CardFooter>

        <div className="px-6 mt-2 text-sm text-muted-foreground">Rounds completed: {rounds}</div>
      </Card>
    </div>
  );
}

export default App;
