import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

describe('ErrorBoundary', () => {
  const mockError = new Error('Test error message');
  const mockReset = vi.fn();

  it('renders error message', () => {
    render(<ErrorBoundary error={mockError} reset={mockReset} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders user-friendly message', () => {
    render(<ErrorBoundary error={mockError} reset={mockReset} />);
    expect(
      screen.getByText(/We encountered an unexpected error/i)
    ).toBeInTheDocument();
  });

  it('renders error digest when provided', () => {
    const errorWithDigest = Object.assign(new Error('Test error message'), { digest: 'abc123' });
    render(<ErrorBoundary error={errorWithDigest} reset={mockReset} />);
    expect(screen.getByText(/Error ID: abc123/i)).toBeInTheDocument();
  });

  it('does not render error digest when not provided', () => {
    render(<ErrorBoundary error={mockError} reset={mockReset} />);
    expect(screen.queryByText(/Error ID:/i)).not.toBeInTheDocument();
  });

  it('renders try again button', () => {
    render(<ErrorBoundary error={mockError} reset={mockReset} />);
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('renders go to homepage link', () => {
    render(<ErrorBoundary error={mockError} reset={mockReset} />);
    const link = screen.getByRole('link', { name: /go to homepage/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });

  it('calls reset function when try again button is clicked', () => {
    render(<ErrorBoundary error={mockError} reset={mockReset} />);
    const button = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(button);
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('logs error to console on mount', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ErrorBoundary error={mockError} reset={mockReset} />);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error caught by boundary:', mockError);
    consoleErrorSpy.mockRestore();
  });
});
