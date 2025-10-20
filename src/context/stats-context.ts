import { createContext } from 'react';

export type Stats = {
  workSessions: number;
  totalFocusSeconds: number;
  totalBreakSeconds: number;
  roundsCompleted: number;
  shortBreaksTaken: number;
  longBreaksTaken: number;
};

export type StatsContextType = {
  stats: Stats;
  recordWorkSession: (seconds: number) => void;
  recordBreak: (seconds: number, isLong?: boolean) => void;
  incrementRounds: (by?: number) => void;
  resetStats: () => void;
};

export const defaultStats: Stats = {
  workSessions: 0,
  totalFocusSeconds: 0,
  totalBreakSeconds: 0,
  roundsCompleted: 0,
  shortBreaksTaken: 0,
  longBreaksTaken: 0,
};

export const StatsContext = createContext<StatsContextType>({
  stats: defaultStats,
  recordWorkSession: () => {},
  recordBreak: () => {},
  incrementRounds: () => {},
  resetStats: () => {},
});
