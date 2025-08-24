'use client';

import { useEffect, useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    const safari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
    setIsIOS(ios && safari);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSPrompt(true);
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // iOS-specific install instructions
  if (showIOSPrompt) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-t-2xl p-6 w-full max-w-md animate-slide-up">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">Install SteppersLife</h3>
            <button
              onClick={() => setShowIOSPrompt(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                <span className="text-2xl">1️⃣</span>
              </div>
              <div>
                <p className="font-medium">Tap the Share button</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Look for the square with arrow icon at the bottom of Safari
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                <span className="text-2xl">2️⃣</span>
              </div>
              <div>
                <p className="font-medium">Scroll down and tap "Add to Home Screen"</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You might need to scroll down in the share menu
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                <span className="text-2xl">3️⃣</span>
              </div>
              <div>
                <p className="font-medium">Tap "Add" to confirm</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  SteppersLife will be added to your home screen
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowIOSPrompt(false)}
            className="w-full mt-6 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition"
          >
            Got it!
          </button>
        </div>
      </div>
    );
  }

  // Show install button for Android/Desktop or iOS
  if (deferredPrompt || isIOS) {
    return (
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg"
        aria-label="Install SteppersLife app"
      >
        <Smartphone size={18} />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">Install</span>
      </button>
    );
  }

  return null;
}

// Add animation styles
const styles = `
@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}