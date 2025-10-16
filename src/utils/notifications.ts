/**
 * Utility functions for desktop notifications
 */

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  // Request permission
  const permission = await Notification.requestPermission();

  return permission;
}

/**
 * Show a desktop notification
 */
export function showNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn(
      'Notification permission not granted, current status:',
      Notification.permission
    );
    return null;
  }

  try {
    // Use absolute URL for icon on macOS Safari/Chrome
    const iconUrl = window.location.origin + './pomodoro.svg';

    const notification = new Notification(title, {
      icon: iconUrl,
      badge: iconUrl,
      tag: 'pomodoro-timer',
      requireInteraction: false,
      silent: false, // Ensure sound is enabled
      ...options,
    });

    // Force focus and visibility
    notification.onclick = () => {
      window.focus();
      if (document.hidden) {
        // Try to bring window to front
        window.focus();
      }
    };

    notification.onerror = (error) => {
      console.error('Notification error:', error);
    };

    // Auto-close after 8 seconds (longer for macOS)
    setTimeout(() => {
      if (notification) {
        notification.close();
      }
    }, 8000);

    return notification;
  } catch (error) {
    console.error('Failed to show notification:', error);
    return null;
  }
}

/**
 * Show notification for completed work session
 */
export function showWorkCompleteNotification(roundNumber: number) {
  return showNotification('Work Session Complete!', {
    body: `Great job! You've completed round ${roundNumber}. Time for a break!`,
    icon: './pomodoro.svg',
  });
}

/**
 * Show notification for completed break
 */
export function showBreakCompleteNotification(isLongBreak: boolean) {
  const breakType = isLongBreak ? 'long break' : 'short break';
  return showNotification(`${isLongBreak ? 'Long' : 'Short'} Break Complete!`, {
    body: `Your ${breakType} is over. Ready to get back to work?`,
    icon: './pomodoro.svg',
  });
}
