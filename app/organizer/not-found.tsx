import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

export default function OrganizerNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="text-center p-8 max-w-lg">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-amber-600 dark:text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Organizer Page Not Found
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            This organizer feature doesn't exist or you don't have access to it.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href={ROUTES.ORGANIZER.DASHBOARD}
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
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            Organizer Dashboard
          </Link>
          
          <Link
            href={ROUTES.ORGANIZER.NEW_EVENT}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium inline-flex items-center justify-center"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Event
          </Link>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Links
          </h3>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Link
              href={ROUTES.ORGANIZER.EVENTS}
              className="text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              My Events
            </Link>
            <Link
              href={ROUTES.ORGANIZER.TICKETS}
              className="text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Ticket Sales
            </Link>
            <Link
              href={ROUTES.ORGANIZER.ANALYTICS}
              className="text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Analytics
            </Link>
            <Link
              href={ROUTES.ORGANIZER.PAYMENT_SETTINGS}
              className="text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Payment Settings
            </Link>
          </div>
        </div>
        
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-500">
          <p>
            Need help?{' '}
            <Link
              href={ROUTES.PROFILE.HELP}
              className="text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Visit our help center
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}