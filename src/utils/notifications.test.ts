import {
  requestNotificationPermission,
  showNotification,
} from './notifications';

describe('Notification Utils', () => {
  let mockConsoleWarn: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;
  const originalNotification = window.Notification;

  beforeEach(() => {
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    mockConsoleWarn.mockRestore();
    mockConsoleError.mockRestore();
    window.Notification = originalNotification;
  });

  describe('requestNotificationPermission', () => {
    it('returns "denied" when Notification API is not supported', async () => {
      delete (window as { Notification?: typeof Notification }).Notification;

      const permission = await requestNotificationPermission();
      expect(permission).toBe('denied');
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'This browser does not support desktop notifications'
      );
    });

    it('returns existing permission when already granted', async () => {
      window.Notification = {
        permission: 'granted',
        requestPermission: jest.fn(),
      } as unknown as typeof Notification;

      const permission = await requestNotificationPermission();
      expect(permission).toBe('granted');
    });

    it('returns existing permission when already denied', async () => {
      window.Notification = {
        permission: 'denied',
        requestPermission: jest.fn(),
      } as unknown as typeof Notification;

      const permission = await requestNotificationPermission();
      expect(permission).toBe('denied');
    });

    it('requests permission when default', async () => {
      const mockRequestPermission = jest.fn().mockResolvedValue('granted');
      window.Notification = {
        permission: 'default',
        requestPermission: mockRequestPermission,
      } as unknown as typeof Notification;

      const permission = await requestNotificationPermission();
      expect(permission).toBe('granted');
      expect(mockRequestPermission).toHaveBeenCalled();
    });
  });

  describe('showNotification', () => {
    it('returns null when Notification API is not supported', () => {
      delete (window as { Notification?: typeof Notification }).Notification;

      const notification = showNotification('Test');
      expect(notification).toBeNull();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'This browser does not support desktop notifications'
      );
    });

    it('returns null when permission is not granted', () => {
      window.Notification = {
        permission: 'denied',
      } as unknown as typeof Notification;

      const notification = showNotification('Test');
      expect(notification).toBeNull();
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Notification permission not granted, current status:',
        'denied'
      );
    });

    it('shows notification when permission is granted', () => {
      const mockNotification = jest.fn();
      window.Notification = class MockNotification {
        constructor(title: string, options?: NotificationOptions) {
          mockNotification(title, options);
        }
        static permission = 'granted';
      } as unknown as typeof Notification;

      const iconUrl = window.location.origin + './pomodoro.svg';
      showNotification('Test Title', { body: 'Test Body' });

      expect(mockNotification).toHaveBeenCalledWith('Test Title', {
        body: 'Test Body',
        icon: iconUrl,
        badge: iconUrl,
        requireInteraction: false,
        silent: false,
        tag: 'pomodoro-timer',
      });
    });

    it('handles notification creation error', () => {
      window.Notification = class MockNotification {
        constructor() {
          throw new Error('Notification creation failed');
        }
        static permission = 'granted';
      } as unknown as typeof Notification;

      const notification = showNotification('Test');
      expect(notification).toBeNull();
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to show notification:',
        expect.any(Error)
      );
    });
  });
});
