import { act } from 'react-dom/test-utils';

// Wrap common jest fake-timer utilities with React's act so timer-driven
// state updates don't trigger "not wrapped in act(...)" warnings in tests.
const timerFns = [
  'advanceTimersByTime',
  'runAllTimers',
  'runOnlyPendingTimers',
  'advanceTimersToNextTimer',
];

timerFns.forEach((fnName) => {
  // @ts-ignore - jest types may not include our runtime augmentation
  const original = (jest as any)[fnName];
  if (typeof original === 'function') {
    // @ts-ignore
    (jest as any)[fnName] = (...args: any[]) =>
      act(() => original.apply(jest, args));
  }
});

// ensure cleanup after each test
import '@testing-library/jest-dom';

// Let React know we're in a test environment that uses act(). This
// suppresses warnings about updates not wrapped in act when using
// fake timers in Jest (React 18+).
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
