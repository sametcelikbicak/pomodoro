import { render, fireEvent, screen } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
  const mockOnOpenPalette = jest.fn();

  beforeEach(() => {
    mockOnOpenPalette.mockClear();
  });

  it('renders the header with logo and title', () => {
    render(<Header onOpenPalette={mockOnOpenPalette} />);

    expect(screen.getByAltText('Pomodoro')).toBeInTheDocument();
    expect(screen.getByText('Pomodoro')).toBeInTheDocument();
    expect(screen.getByText('Focus Time')).toBeInTheDocument();
  });

  it('calls onOpenPalette when shortcut button is clicked', () => {
    render(<Header onOpenPalette={mockOnOpenPalette} />);

    const shortcutButton = screen.getByRole('button');
    fireEvent.click(shortcutButton);

    expect(mockOnOpenPalette).toHaveBeenCalledTimes(1);
  });

  it('shows correct shortcut for Mac platform', () => {
    // Mock Mac platform
    const originalNavigator = window.navigator;
    Object.defineProperty(window, 'navigator', {
      value: {
        ...originalNavigator,
        platform: 'MacIntel',
      },
      configurable: true,
    });

    render(<Header onOpenPalette={mockOnOpenPalette} />);

    expect(screen.getByText('⌘')).toBeInTheDocument();
    expect(screen.getByText('K')).toBeInTheDocument();

    // Reset navigator
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      configurable: true,
    });
  });

  it('shows correct shortcut for non-Mac platform', () => {
    // Mock Windows platform
    const originalNavigator = window.navigator;
    Object.defineProperty(window, 'navigator', {
      value: {
        ...originalNavigator,
        platform: 'Win32',
      },
      configurable: true,
    });

    render(<Header onOpenPalette={mockOnOpenPalette} />);

    expect(screen.getByText('Ctrl')).toBeInTheDocument();
    expect(screen.getByText('K')).toBeInTheDocument();

    // Reset navigator
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      configurable: true,
    });
  });

  it('handles missing onOpenPalette prop gracefully', () => {
    render(<Header />);

    const shortcutButton = screen.getByRole('button');
    fireEvent.click(shortcutButton);
    // Should not throw error
  });
});
