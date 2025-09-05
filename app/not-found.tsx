import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="text-center p-8 max-w-lg">
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            404
          </h1>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4 mb-2">
            Page Not Found
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href={ROUTES.HOME}
            className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium inline-flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go Home
          </Link>
          
          <Link
            href={ROUTES.EVENTS}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium inline-flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Browse Events
          </Link>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Popular Pages
          </h3>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Link
              href={ROUTES.ORGANIZER.NEW_EVENT}
              className="text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Create Event
            </Link>
            <Link
              href={ROUTES.ORGANIZER.DASHBOARD}
              className="text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Organizer Dashboard
            </Link>
            <Link
              href={ROUTES.PROFILE.TICKETS}
              className="text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              My Tickets
            </Link>
            <Link
              href={ROUTES.ABOUT}
              className="text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}