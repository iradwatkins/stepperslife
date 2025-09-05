'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="text-center p-8 max-w-md">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Oops! Something went wrong
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We encountered an unexpected error. Don't worry, we've been notified and are working on it.
          </p>
          
          {error.digest && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-6 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
          >
            Try Again
          </button>
          
          <Link
            href={ROUTES.HOME}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Go Home
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-500">
          <p>
            If this problem persists,{' '}
            <a
              href="mailto:support@stepperslife.com"
              className="text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}