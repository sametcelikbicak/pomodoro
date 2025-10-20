import { render, fireEvent, screen, act } from '@testing-library/react';
import CommandPalette from './CommandPalette';

// Mock ResizeObserver and scrollIntoView
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

// Mock scrollIntoView
Element.prototype.scrollIntoView = function () {};

describe('CommandPalette', () => {
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    mockOnOpenChange.mockClear();
    // Clear any previously added event listeners
    window.dispatchEvent = jest.fn();
  });

  it('renders command palette when open', () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search.../i)).toBeInTheDocument();
  });

  it('does not render command palette when closed', () => {
    render(<CommandPalette open={false} onOpenChange={mockOnOpenChange} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('displays all command items', () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText('Start / Pause timer')).toBeInTheDocument();
    expect(screen.getByText('Reset timer')).toBeInTheDocument();
    expect(screen.getByText('Switch to Work')).toBeInTheDocument();
    expect(screen.getByText('Start Short Break')).toBeInTheDocument();
    expect(screen.getByText('Start Long Break')).toBeInTheDocument();
    expect(screen.getByText('Toggle Auto-break')).toBeInTheDocument();
    expect(screen.getByText('Statistics')).toBeInTheDocument();
  });

  it('filters commands based on search input', () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />);

    const input = screen.getByPlaceholderText(/search.../i);
    fireEvent.change(input, { target: { value: 'break' } });

    expect(screen.getByText('Start Short Break')).toBeInTheDocument();
    expect(screen.getByText('Start Long Break')).toBeInTheDocument();
    expect(screen.getByText('Toggle Auto-break')).toBeInTheDocument();
    expect(screen.queryByText('Reset timer')).not.toBeInTheDocument();
  });

  it('dispatches event and closes palette when command is selected', () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />);

    const workCommand = screen.getByText('Switch to Work');
    fireEvent.click(workCommand);

    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { id: 'work' },
      })
    );
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('handles keyboard shortcuts when query is empty', () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />);

    // Press 'w' for "Switch to Work"
    fireEvent.keyDown(document, { key: 'w' });

    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { id: 'work' },
      })
    );
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('ignores keyboard shortcuts when query is not empty', () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />);

    const input = screen.getByPlaceholderText(/search.../i);
    fireEvent.change(input, { target: { value: 'some search' } });

    // Press 'w' for "Switch to Work"
    fireEvent.keyDown(document, { key: 'w' });

    expect(window.dispatchEvent).not.toHaveBeenCalled();
    expect(mockOnOpenChange).not.toHaveBeenCalled();
  });

  it('focuses input when opened', async () => {
    jest.useFakeTimers();

    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />);

    act(() => {
      jest.advanceTimersByTime(100);
    });

    const input = screen.getByPlaceholderText(/search.../i);
    expect(document.activeElement).toBe(input);

    jest.useRealTimers();
  });

  it('ignores keyboard shortcuts with modifiers', () => {
    render(<CommandPalette open={true} onOpenChange={mockOnOpenChange} />);

    fireEvent.keyDown(document, { key: 'w', ctrlKey: true });
    fireEvent.keyDown(document, { key: 'w', metaKey: true });
    fireEvent.keyDown(document, { key: 'w', altKey: true });

    expect(window.dispatchEvent).not.toHaveBeenCalled();
    expect(mockOnOpenChange).not.toHaveBeenCalled();
  });
});
