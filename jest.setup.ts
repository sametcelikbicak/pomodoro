import { act } from 'react-dom/test-utils';

// Wrap common jest fake-timer utilities with React's act so timer-driven
// state updates don't trigger "not wrapped in act(...)" warnings in tests.
const timerFns = [
  'advanceTimersByTime',
  'runAllTimers',
  'runOnlyPendingTimers',
  'advanceTimersToNextTimer',
];

type JestWithTimers = {
  [key: string]: unknown;
  advanceTimersByTime?: (ms: number) => void;
  runAllTimers?: () => void;
  runOnlyPendingTimers?: () => void;
  advanceTimersToNextTimer?: () => void;
};

timerFns.forEach((fnName) => {
  const original = (jest as JestWithTimers)[fnName];
  if (typeof original === 'function') {
    (jest as JestWithTimers)[fnName] = (...args: unknown[]) =>
      act(() => original.apply(jest, args));
  }
});

// ensure cleanup after each test
import '@testing-library/jest-dom';

// Let React know we're in a test environment that uses act(). This
// suppresses warnings about updates not wrapped in act when using
// fake timers in Jest (React 18+).
declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
