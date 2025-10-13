import { useEffect, useRef, useState } from "react";
import { useStats } from "@/context/StatsContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { TimerIcon } from "lucide-react";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function Pomodoro() {
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

  const { recordWorkSession, recordBreak, incrementRounds } = useStats();

  // remember original document title so we can restore it on unmount
  const originalTitleRef = useRef<string>(
    typeof document !== "undefined" ? document.title : "",
  );

  // update document.title to show remaining time, current mode and paused state
  useEffect(() => {
    const mode = isWork ? "Focus" : isLongBreak ? "Long Break" : "Short Break";
    const paused = isRunning ? "" : " (Paused)";
    // format time and set title
    document.title = `${formatTime(Math.max(0, secondsLeft))} — ${mode}${paused}`;
  }, [secondsLeft, isWork, isLongBreak, isRunning]);

  // restore original title when component unmounts
  useEffect(() => {
    return () => {
      document.title = originalTitleRef.current;
    };
  }, []);

  // keep secondsLeft in sync when durations change and timer not running
  useEffect(() => {
    if (!isRunning) {
      // reset seconds to the appropriate duration when not running
      setSecondsLeft(
        isWork
          ? workMinutes * 60
          : isLongBreak
            ? longBreakMinutes * 60
            : shortBreakMinutes * 60,
      );
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
    // compute elapsed seconds from configured durations and remaining seconds
    const originalTotal = isWork
      ? workMinutes * 60
      : isLongBreak
        ? longBreakMinutes * 60
        : shortBreakMinutes * 60;
    const elapsedSec = Math.max(0, originalTotal - Math.max(0, secondsLeft));

    if (isWork) {
      // just finished a work session
      setRounds((r) => {
        const newRounds = r + 1;
        const useLong =
          cyclesBeforeLongBreak > 0 && newRounds % cyclesBeforeLongBreak === 0;
        setIsWork(false);
        setIsLongBreak(useLong);
        setSecondsLeft((useLong ? longBreakMinutes : shortBreakMinutes) * 60);
        if (autoStartBreak) setIsRunning(true);
        // record stats: actual elapsed computed from timer
        try {
          recordWorkSession(elapsedSec);
          incrementRounds(1);
        } catch (e) {
          // ignore
        }
        return newRounds;
      });
    } else {
      // finished a break
      try {
        recordBreak(elapsedSec, Boolean(isLongBreak));
      } catch (e) {
        // ignore
      }

      setIsWork(true);
      setIsLongBreak(false);
      setSecondsLeft(workMinutes * 60);
      // do not auto-start work by default
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, cyclesBeforeLongBreak, shortBreakMinutes, longBreakMinutes]);

  const total =
    (isWork
      ? workMinutes * 60
      : isLongBreak
        ? longBreakMinutes * 60
        : shortBreakMinutes * 60) || 1;
  const progress = Math.max(
    0,
    Math.min(100, Math.round((1 - secondsLeft / total) * 100)),
  );

  function startPause() {
    setIsRunning((r) => !r);
  }

  function reset() {
    // record partial session elapsed time on reset
    try {
      const originalTotal = isWork
        ? workMinutes * 60
        : isLongBreak
          ? longBreakMinutes * 60
          : shortBreakMinutes * 60;
      const elapsed = Math.max(0, originalTotal - Math.max(0, secondsLeft));
      if (elapsed > 0) {
        if (isWork) recordWorkSession(elapsed);
        else recordBreak(elapsed, Boolean(isLongBreak));
      }
    } catch (e) {
      // ignore
    }

    setIsRunning(false);
    setIsWork(true);
    setSecondsLeft(workMinutes * 60);
    setRounds(0);
  }

  return (
    <Card className="w-full max-w-md sm:max-w-lg transition-shadow shadow-lg">
      <CardHeader>
        <div className="flex w-full items-center justify-between gap-4 flex-col sm:flex-row">
          <div className="flex items-center gap-3">
            <img
              src="./pomodoro.svg"
              alt="Pomodoro"
              width={40}
              height={40}
              className="rounded-full shadow-sm"
            />
            <div>
              <CardTitle>Pomodoro</CardTitle>
              <CardDescription className="capitalize">
                {isWork ? "Focus time" : "Break time"}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">Auto-break</div>
            <Switch
              checked={autoStartBreak}
              onCheckedChange={(v) => setAutoStartBreak(Boolean(v))}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div
            aria-live="polite"
            className="text-5xl sm:text-6xl md:text-7xl font-mono font-semibold"
            style={{ color: isWork ? "var(--primary)" : "var(--secondary)" }}
          >
            {formatTime(Math.max(0, secondsLeft))}
          </div>
          <div className="w-full">
            <Progress value={progress} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
            <div className="col-span-1">
              <label
                htmlFor="work-minutes"
                className="text-xs text-muted-foreground"
              >
                Work (min)
              </label>
              <Input
                id="work-minutes"
                type="number"
                value={workMinutes}
                onChange={(e) =>
                  setWorkMinutes(Math.max(1, Number(e.target.value) || 1))
                }
                className="mt-1"
              />
            </div>
            <div className="col-span-1">
              <label
                htmlFor="short-break"
                className="text-xs text-muted-foreground"
              >
                Short break (min)
              </label>
              <Input
                id="short-break"
                type="number"
                value={shortBreakMinutes}
                onChange={(e) =>
                  setShortBreakMinutes(Math.max(1, Number(e.target.value) || 1))
                }
                className="mt-1"
              />
            </div>
            <div className="col-span-1">
              <label
                htmlFor="long-break"
                className="text-xs text-muted-foreground"
              >
                Long break (min)
              </label>
              <Input
                id="long-break"
                type="number"
                value={longBreakMinutes}
                onChange={(e) =>
                  setLongBreakMinutes(Math.max(1, Number(e.target.value) || 1))
                }
                className="mt-1"
              />
            </div>
          </div>
          <div className="w-full mt-2">
            <label htmlFor="cycles" className="text-xs text-muted-foreground">
              Cycles before long break
            </label>
            <Input
              id="cycles"
              type="number"
              value={cyclesBeforeLongBreak}
              onChange={(e) =>
                setCyclesBeforeLongBreak(
                  Math.max(1, Number(e.target.value) || 1),
                )
              }
              className="mt-1"
            />
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
          <Button onClick={startPause} className="w-full sm:flex-1">
            <TimerIcon /> {isRunning ? "Pause" : "Start"}
          </Button>
          <Button
            variant="outline"
            onClick={reset}
            className="w-full sm:w-auto"
          >
            Reset
          </Button>
        </div>
      </CardFooter>

      <div className="px-6 mt-2 text-sm text-muted-foreground">
        Rounds completed: {rounds}
      </div>
    </Card>
  );
}

export default Pomodoro;
