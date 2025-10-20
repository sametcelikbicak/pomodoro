import { useEffect, useRef, useState } from 'react';
import { useStats } from '@/hooks/use-stats';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { TimerIcon } from 'lucide-react';
import {
  showWorkCompleteNotification,
  showBreakCompleteNotification,
} from '@/utils/notifications';

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, '0');
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

  // small Web Audio-based player so we can play distinct sounds per session type
  const audioCtxRef = useRef<AudioContext | null>(null);

  function ensureAudioContext() {
    if (!audioCtxRef.current) {
      const Ctor =
        (
          window as {
            AudioContext?: typeof AudioContext;
            webkitAudioContext?: typeof AudioContext;
          }
        ).AudioContext ||
        (
          window as {
            AudioContext?: typeof AudioContext;
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;
      if (Ctor) audioCtxRef.current = new Ctor();
    }
    return audioCtxRef.current;
  }

  function playTone(freq: number, duration = 0.15, when = 0) {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.3, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  function playSequence(
    sequence: Array<{ freq: number; dur?: number; gap?: number }>
  ) {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    let offset = 0;
    for (const item of sequence) {
      playTone(item.freq, item.dur ?? 0.15, offset);
      offset += (item.dur ?? 0.15) + (item.gap ?? 0.08);
    }
  }

  function playSoundForFinishedSession(type: 'work' | 'short' | 'long') {
    // try to resume context (user gesture may be required on some browsers)
    const ctx = ensureAudioContext();
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});

    if (type === 'work') {
      // single higher beep
      playSequence([{ freq: 880, dur: 2 }]);
    } else if (type === 'short') {
      // two medium beeps
      playSequence([
        { freq: 770, dur: 0.5 },
        { freq: 660, dur: 0.5, gap: 0.12 },
      ]);
    } else {
      // long break: three lower beeps
      playSequence([
        { freq: 550, dur: 0.5 },
        { freq: 440, dur: 0.5, gap: 0.08 },
        { freq: 330, dur: 0.5, gap: 0.08 },
      ]);
    }
  }

  // remember original document title so we can restore it on unmount
  const originalTitleRef = useRef<string>(
    typeof document !== 'undefined' ? document.title : ''
  );

  // update document.title to show remaining time, current mode and paused state
  useEffect(() => {
    const mode = isWork ? 'Focus' : isLongBreak ? 'Long Break' : 'Short Break';
    const paused = isRunning ? '' : ' (Paused)';
    // format time and set title
    document.title = `${formatTime(Math.max(0, secondsLeft))} — ${mode}${paused}`;
  }, [secondsLeft, isWork, isLongBreak, isRunning]);

  // restore original title when component unmounts
  useEffect(() => {
    const titleToRestore = originalTitleRef.current;
    return () => {
      document.title = titleToRestore;
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
            : shortBreakMinutes * 60
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
    // play a sound for the finished session
    try {
      if (isWork) playSoundForFinishedSession('work');
      else playSoundForFinishedSession(isLongBreak ? 'long' : 'short');
    } catch {
      // ignore audio errors
    }
    // compute elapsed seconds from configured durations and remaining seconds
    const originalTotal = isWork
      ? workMinutes * 60
      : isLongBreak
        ? longBreakMinutes * 60
        : shortBreakMinutes * 60;
    const elapsedSec = Math.max(0, originalTotal - Math.max(0, secondsLeft));

    if (isWork) {
      // just finished a work session
      const newRounds = rounds + 1;
      const useLong =
        cyclesBeforeLongBreak > 0 && newRounds % cyclesBeforeLongBreak === 0;
      // update local state
      setRounds(newRounds);
      setIsWork(false);
      setIsLongBreak(useLong);
      setSecondsLeft((useLong ? longBreakMinutes : shortBreakMinutes) * 60);
      if (autoStartBreak) setIsRunning(true);
      try {
        showWorkCompleteNotification(newRounds);
      } catch (e) {
        console.error('Error showing work notification:', e);
      }
      // record stats after state updates to avoid cross-component setState during render
      try {
        // schedule on next tick to be safe
        Promise.resolve().then(() => {
          recordWorkSession(elapsedSec);
          incrementRounds(1);
        });
      } catch {
        // ignore
      }
    } else {
      // finished a break

      try {
        showBreakCompleteNotification(isLongBreak);
      } catch (e) {
        console.error('Error showing break notification:', e);
      }
      try {
        // schedule recording to avoid cross-component setState during render
        Promise.resolve().then(() => {
          recordBreak(elapsedSec, Boolean(isLongBreak));
        });
      } catch {
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
    Math.min(100, Math.round((1 - secondsLeft / total) * 100))
  );

  function startPause() {
    setIsRunning((r) => !r);
    // resume audio context on first user interaction so browsers allow sound later
    const ctx = ensureAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
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
    } catch {
      // ignore
    }

    setIsRunning(false);
    setIsWork(true);
    setSecondsLeft(workMinutes * 60);
    setRounds(0);
  }

  // listen to global commands (from command palette)
  useEffect(() => {
    function onCmd(ev: Event) {
      const e = ev as CustomEvent<{ id: string }>;
      const id = e?.detail?.id;
      if (!id) return;
      switch (id) {
        case 'start-pause':
          startPause();
          break;
        case 'reset':
          reset();
          break;
        case 'work':
          setIsWork(true);
          setIsLongBreak(false);
          setSecondsLeft(workMinutes * 60);
          setIsRunning(false);
          break;
        case 'short':
          setIsWork(false);
          setIsLongBreak(false);
          setSecondsLeft(shortBreakMinutes * 60);
          setIsRunning(true);
          break;
        case 'long':
          setIsWork(false);
          setIsLongBreak(true);
          setSecondsLeft(longBreakMinutes * 60);
          setIsRunning(true);
          break;
        case 'toggle-auto':
          setAutoStartBreak((v) => !v);
          break;
        case 'open-stats': {
          // scroll statistics into view
          const stats = document.querySelector('[data-slot=statistics]');
          if (stats)
            stats.scrollIntoView({ behavior: 'smooth', block: 'center' });
          break;
        }
      }
    }
    window.addEventListener('pomodoro:command', onCmd as EventListener);
    return () =>
      window.removeEventListener('pomodoro:command', onCmd as EventListener);
    // include dependencies that represent the durations so commands set correct seconds
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workMinutes, shortBreakMinutes, longBreakMinutes]);

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
                {isWork ? 'Focus time' : 'Break time'}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">Auto-break</div>
            <Switch
              className="cursor-pointer"
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
            style={{ color: isWork ? 'var(--primary)' : 'var(--secondary)' }}
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
                  Math.max(1, Number(e.target.value) || 1)
                )
              }
              className="mt-1"
            />
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
          <Button
            onClick={startPause}
            className="w-full sm:flex-1 cursor-pointer"
          >
            <TimerIcon /> {isRunning ? 'Pause' : 'Start'}
          </Button>
          <Button
            variant="outline"
            onClick={reset}
            className="w-full sm:w-auto cursor-pointer"
          >
            Reset
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default Pomodoro;
