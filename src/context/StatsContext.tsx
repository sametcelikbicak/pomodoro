import React, { createContext, useContext, useEffect, useState } from "react";

type Stats = {
    workSessions: number;
    totalFocusSeconds: number;
    totalBreakSeconds: number;
    roundsCompleted: number;
    longBreaksTaken: number;
};

type StatsContextType = {
    stats: Stats;
    recordWorkSession: (seconds: number) => void;
    recordBreak: (seconds: number, isLong?: boolean) => void;
    incrementRounds: (by?: number) => void;
    resetStats: () => void;
};

const defaultStats: Stats = {
    workSessions: 0,
    totalFocusSeconds: 0,
    totalBreakSeconds: 0,
    roundsCompleted: 0,
    longBreaksTaken: 0,
};

const StatsContext = createContext<StatsContextType>({
    stats: defaultStats,
    recordWorkSession: () => { },
    recordBreak: () => { },
    incrementRounds: () => { },
    resetStats: () => { },
});

export const useStats = () => useContext(StatsContext);

export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [stats, setStats] = useState<Stats>(() => {
        try {
            const raw = typeof window !== 'undefined' ? window.localStorage.getItem('pomodoro_stats') : null;
            return raw ? JSON.parse(raw) : defaultStats;
        } catch (e) {
            return defaultStats;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem('pomodoro_stats', JSON.stringify(stats));
        } catch (e) {
            // ignore
        }
    }, [stats]);

    const recordWorkSession = (seconds: number) => {
        setStats((s) => ({ ...s, workSessions: s.workSessions + 1, totalFocusSeconds: s.totalFocusSeconds + seconds }));
    };

    const recordBreak = (seconds: number, isLong = false) => {
        setStats((s) => ({ ...s, totalBreakSeconds: s.totalBreakSeconds + seconds, longBreaksTaken: s.longBreaksTaken + (isLong ? 1 : 0) }));
    };

    const incrementRounds = (by = 1) => setStats((s) => ({ ...s, roundsCompleted: s.roundsCompleted + by }));

    const resetStats = () => {
        setStats(defaultStats);
        try {
            window.localStorage.removeItem('pomodoro_stats');
        } catch (e) {
            // ignore
        }
    };

    return (
        <StatsContext.Provider value={{ stats, recordWorkSession, recordBreak, incrementRounds, resetStats }}>
            {children}
        </StatsContext.Provider>
    );
};

export default StatsContext;
