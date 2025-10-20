import { render, screen, fireEvent } from '@testing-library/react';
import Statistics from './Statistics';
import { StatsProvider } from '../../context/StatsProvider';

describe('Statistics component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders stats from context/localStorage and resets', () => {
    // pre-populate localStorage with some stats
    localStorage.setItem(
      'pomodoro_stats',
      JSON.stringify({
        workSessions: 2,
        totalFocusSeconds: 3600,
        totalBreakSeconds: 600,
        roundsCompleted: 3,
        longBreaksTaken: 1,
      })
    );

    render(
      <StatsProvider>
        <Statistics />
      </StatsProvider>
    );

    expect(screen.getByText(/Work sessions/i).nextSibling).toBeTruthy();
    expect(screen.getByText(/2/)).not.toBeNull();
    expect(screen.getByText(/01:00:00/)).not.toBeNull(); // 3600s
    expect(screen.getByText(/00:10:00/)).not.toBeNull(); // 600s

    // click reset
    const reset = screen.getByText(/Reset stats/i);
    fireEvent.click(reset);

    // after reset, stats should be zeros
    const zeroTimes = screen.getAllByText(/00:00:00/);
    expect(zeroTimes.length).toBe(2); // total focus and total break
    // work sessions should be 0
    expect(screen.getByText(/Work sessions/i).nextSibling).toHaveTextContent(
      '0'
    );
  });
});
