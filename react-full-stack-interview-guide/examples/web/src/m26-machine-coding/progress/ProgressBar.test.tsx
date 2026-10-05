import { act, fireEvent, render, screen } from '@testing-library/react';
import { AutoProgress, ProgressBar } from './ProgressBar';

afterEach(() => vi.useRealTimers());

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

describe('ProgressBar', () => {
  test('exposes the progressbar contract', () => {
    render(<ProgressBar label="Upload" value={30} />);
    const bar = screen.getByRole('progressbar', { name: 'Upload' });
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuenow', '30');
  });

  test('clamps out-of-range values', () => {
    const { rerender } = render(<ProgressBar label="Upload" value={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    rerender(<ProgressBar label="Upload" value={-5} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });
});

describe('AutoProgress', () => {
  beforeEach(() => vi.useFakeTimers());

  test('does nothing until Start, then fills with the clock', () => {
    render(<AutoProgress durationMs={1000} />);
    advance(2000);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(vi.getTimerCount()).toBe(0);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    advance(500);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '500');
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  test('finishes once: calls onDone, stops the interval and offers Reset', () => {
    const onDone = vi.fn();
    render(<AutoProgress durationMs={1000} onDone={onDone} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));

    advance(5000);
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
  });

  test('Pause freezes the value and Start resumes from it', () => {
    render(<AutoProgress durationMs={1000} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    advance(300);

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    advance(5000);
    expect(screen.getByText('30%')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    advance(200);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  test('unmounting clears the interval', () => {
    const { unmount } = render(<AutoProgress durationMs={1000} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
