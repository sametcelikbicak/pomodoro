import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import {
  StatsContext,
  type Stats,
  type StatsContextType,
  defaultStats,
} from './stats-context';

export const StatsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<Stats>(() => {
    try {
      const raw =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('pomodoro_stats')
          : null;
      return raw ? JSON.parse(raw) : defaultStats;
    } catch {
      return defaultStats;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('pomodoro_stats', JSON.stringify(stats));
    } catch {
      // ignore
    }
  }, [stats]);

  const recordWorkSession = useCallback((seconds: number) => {
    setStats((s) => ({
      ...s,
      workSessions: s.workSessions + 1,
      totalFocusSeconds: s.totalFocusSeconds + seconds,
    }));
  }, []);

  const recordBreak = useCallback((seconds: number, isLong = false) => {
    setStats((s) => ({
      ...s,
      totalBreakSeconds: s.totalBreakSeconds + seconds,
      shortBreaksTaken: s.shortBreaksTaken + (isLong ? 0 : 1),
      longBreaksTaken: s.longBreaksTaken + (isLong ? 1 : 0),
    }));
  }, []);

  const incrementRounds = useCallback((by = 1) => {
    setStats((s) => ({ ...s, roundsCompleted: s.roundsCompleted + by }));
  }, []);

  const resetStats = useCallback(() => {
    setStats(defaultStats);
    try {
      window.localStorage.removeItem('pomodoro_stats');
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<StatsContextType>(
    () => ({
      stats,
      recordWorkSession,
      recordBreak,
      incrementRounds,
      resetStats,
    }),
    [stats, recordWorkSession, recordBreak, incrementRounds, resetStats]
  );

  return <StatsContext value={value}>{children}</StatsContext>;
};
