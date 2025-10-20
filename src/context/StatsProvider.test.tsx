import { render, screen, act } from '@testing-library/react';
import { useStats } from '../hooks/use-stats';
import { StatsProvider } from './StatsProvider';

// Test component that uses the stats context
function TestComponent() {
  const { stats, recordWorkSession, recordBreak, incrementRounds, resetStats } =
    useStats();
  return (
    <div>
      <div data-testid="work-sessions">{stats.workSessions}</div>
      <div data-testid="focus-seconds">{stats.totalFocusSeconds}</div>
      <div data-testid="break-seconds">{stats.totalBreakSeconds}</div>
      <div data-testid="rounds">{stats.roundsCompleted}</div>
      <div data-testid="short-breaks">{stats.shortBreaksTaken}</div>
      <div data-testid="long-breaks">{stats.longBreaksTaken}</div>
      <button type="button" onClick={() => recordWorkSession(25 * 60)}>
        Record Work
      </button>
      <button type="button" onClick={() => recordBreak(5 * 60)}>
        Record Short Break
      </button>
      <button type="button" onClick={() => recordBreak(15 * 60, true)}>
        Record Long Break
      </button>
      <button type="button" onClick={() => incrementRounds()}>
        Increment Round
      </button>
      <button type="button" onClick={resetStats}>
        Reset
      </button>
    </div>
  );
}

describe('StatsContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });

  it('provides default stats initially', () => {
    render(
      <StatsProvider>
        <TestComponent />
      </StatsProvider>
    );

    expect(screen.getByTestId('work-sessions')).toHaveTextContent('0');
    expect(screen.getByTestId('focus-seconds')).toHaveTextContent('0');
    expect(screen.getByTestId('break-seconds')).toHaveTextContent('0');
    expect(screen.getByTestId('rounds')).toHaveTextContent('0');
    expect(screen.getByTestId('short-breaks')).toHaveTextContent('0');
    expect(screen.getByTestId('long-breaks')).toHaveTextContent('0');
  });

  it('records work sessions correctly', () => {
    render(
      <StatsProvider>
        <TestComponent />
      </StatsProvider>
    );

    act(() => {
      screen.getByText('Record Work').click();
    });

    expect(screen.getByTestId('work-sessions')).toHaveTextContent('1');
    expect(screen.getByTestId('focus-seconds')).toHaveTextContent('1500'); // 25 * 60
  });

  it('records breaks correctly', () => {
    render(
      <StatsProvider>
        <TestComponent />
      </StatsProvider>
    );

    // Record short break
    act(() => {
      screen.getByText('Record Short Break').click();
    });

    expect(screen.getByTestId('break-seconds')).toHaveTextContent('300'); // 5 * 60
    expect(screen.getByTestId('short-breaks')).toHaveTextContent('1');
    expect(screen.getByTestId('long-breaks')).toHaveTextContent('0');

    // Record long break
    act(() => {
      screen.getByText('Record Long Break').click();
    });

    expect(screen.getByTestId('break-seconds')).toHaveTextContent('1200'); // (5 + 15) * 60
    expect(screen.getByTestId('short-breaks')).toHaveTextContent('1');
    expect(screen.getByTestId('long-breaks')).toHaveTextContent('1');
  });

  it('increments rounds correctly', () => {
    render(
      <StatsProvider>
        <TestComponent />
      </StatsProvider>
    );

    act(() => {
      screen.getByText('Increment Round').click();
    });

    expect(screen.getByTestId('rounds')).toHaveTextContent('1');
  });

  it('resets stats correctly', () => {
    render(
      <StatsProvider>
        <TestComponent />
      </StatsProvider>
    );

    // Record some data
    act(() => {
      screen.getByText('Record Work').click();
      screen.getByText('Record Short Break').click();
      screen.getByText('Increment Round').click();
    });

    // Reset stats
    act(() => {
      screen.getByText('Reset').click();
    });

    expect(screen.getByTestId('work-sessions')).toHaveTextContent('0');
    expect(screen.getByTestId('focus-seconds')).toHaveTextContent('0');
    expect(screen.getByTestId('break-seconds')).toHaveTextContent('0');
    expect(screen.getByTestId('rounds')).toHaveTextContent('0');
    expect(screen.getByTestId('short-breaks')).toHaveTextContent('0');
    expect(screen.getByTestId('long-breaks')).toHaveTextContent('0');
  });

  it('persists data to localStorage', () => {
    render(
      <StatsProvider>
        <TestComponent />
      </StatsProvider>
    );

    act(() => {
      screen.getByText('Record Work').click();
    });

    // Check localStorage
    const stored = JSON.parse(
      window.localStorage.getItem('pomodoro_stats') || '{}'
    );
    expect(stored.workSessions).toBe(1);
    expect(stored.totalFocusSeconds).toBe(1500);
  });

  it('loads data from localStorage on initialization', () => {
    // Set initial data in localStorage
    const initialStats = {
      workSessions: 5,
      totalFocusSeconds: 7500,
      totalBreakSeconds: 1500,
      roundsCompleted: 5,
      shortBreaksTaken: 4,
      longBreaksTaken: 1,
    };
    window.localStorage.setItem('pomodoro_stats', JSON.stringify(initialStats));

    render(
      <StatsProvider>
        <TestComponent />
      </StatsProvider>
    );

    expect(screen.getByTestId('work-sessions')).toHaveTextContent('5');
    expect(screen.getByTestId('focus-seconds')).toHaveTextContent('7500');
    expect(screen.getByTestId('break-seconds')).toHaveTextContent('1500');
    expect(screen.getByTestId('rounds')).toHaveTextContent('5');
    expect(screen.getByTestId('short-breaks')).toHaveTextContent('4');
    expect(screen.getByTestId('long-breaks')).toHaveTextContent('1');
  });

  it('handles localStorage errors gracefully', () => {
    // Mock localStorage.getItem to throw an error
    const mockGetItem = jest.spyOn(Storage.prototype, 'getItem');
    mockGetItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    render(
      <StatsProvider>
        <TestComponent />
      </StatsProvider>
    );

    // Should render with default values
    expect(screen.getByTestId('work-sessions')).toHaveTextContent('0');

    // Cleanup
    mockGetItem.mockRestore();
  });
});
