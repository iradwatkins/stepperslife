'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export default function PWARegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          setRegistration(reg);
          console.log('Service Worker registered:', reg.scope);

          // Check for updates every hour
          setInterval(() => {
            reg.update();
          }, 3600000);

          // Listen for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available
                  setUpdateAvailable(true);
                  console.log('New service worker available');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });

      // Handle controller change (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      // Check deployment version periodically for Blue-Green
      checkDeploymentVersion();
    }
  }, []);

  const checkDeploymentVersion = async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data) {
          console.log(`Current deployment: ${event.data.deployment} (${event.data.version})`);
          // Store deployment info for monitoring
          localStorage.setItem('sw-deployment', event.data.deployment);
          localStorage.setItem('sw-version', event.data.version);
        }
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_VERSION' },
        [messageChannel.port2]
      );
    }
  };

  const handleUpdate = () => {
    if (registration?.waiting) {
      // Tell SW to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
    }
  };

  if (updateAvailable) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-sm border border-purple-500">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <RefreshCw className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Update Available
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                A new version of SteppersLife is available. Refresh to update.
              </p>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={handleUpdate}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Update Now
                </button>
                <button
                  onClick={() => setUpdateAvailable(false)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}