'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary component for handling runtime errors in the application.
 * This is used by Next.js error.tsx files to display user-friendly error messages.
 */
export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error caught by boundary:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 dark:border-red-900 dark:bg-red-950">
        <h2 className="mb-4 text-2xl font-semibold text-red-900 dark:text-red-100">
          Something went wrong
        </h2>
        <p className="mb-6 text-red-700 dark:text-red-300">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>
        {error.digest && (
          <p className="mb-6 text-sm text-red-600 dark:text-red-400">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-4">
          <button
            onClick={reset}
            className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-red-300 px-4 py-2 font-medium text-red-900 transition-colors hover:bg-red-100 dark:border-red-800 dark:text-red-100 dark:hover:bg-red-900"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
