import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import Pomodoro from './Pomodoro';
import { StatsProvider } from '../../context/StatsContext';

describe('Pomodoro component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders initial state', () => {
    render(
      <StatsProvider>
        <Pomodoro />
      </StatsProvider>
    );

    // default work minutes is 25 -> 25:00
    expect(screen.getByText(/25:00/)).not.toBeNull();
    expect(screen.getByRole('button', { name: /Start/i })).not.toBeNull();
    expect(screen.getByText(/Rounds completed: 0/)).not.toBeNull();
  });

  it('completes a 1-minute work session and records stats', async () => {
    render(
      <StatsProvider>
        <Pomodoro />
      </StatsProvider>
    );

    const workInput = screen.getByLabelText(
      /Work \(min\)/i
    ) as HTMLInputElement;
    // set to 1 minute for a fast test
    fireEvent.change(workInput, { target: { value: '1' } });

    const startBtn = screen.getByRole('button', { name: /Start/i });
    fireEvent.click(startBtn);

    // advance slightly more than 60s so the session finishes
    act(() => {
      jest.advanceTimersByTime(61_000);
    });

    await waitFor(() => {
      const raw = localStorage.getItem('pomodoro_stats');
      expect(raw).not.toBeNull();
      const stats = raw ? JSON.parse(raw) : null;
      expect(stats.workSessions).toBe(1);
      expect(stats.totalFocusSeconds).toBe(60);
      expect(stats.roundsCompleted).toBe(1);
    });

    // rounds label should update in the UI too
    expect(screen.getByText(/Rounds completed: 1/)).not.toBeNull();
  });
});
