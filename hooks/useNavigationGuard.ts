import { useCallback, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function useNavigationGuard() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const lastNavigationRef = useRef<string>('');
  const navigationTimeoutRef = useRef<NodeJS.Timeout>();

  const safeNavigate = useCallback((url: string, options?: { replace?: boolean }) => {
    // Prevent concurrent navigation
    if (isNavigating) {
      console.warn('Navigation already in progress, ignoring:', url);
      return false;
    }

    // Prevent navigating to the same URL
    if (typeof window !== 'undefined' && window.location.pathname === url) {
      console.log('Already at destination:', url);
      return false;
    }

    // Prevent rapid repeated navigation to same destination
    if (lastNavigationRef.current === url && Date.now() - Number(navigationTimeoutRef.current) < 1000) {
      console.warn('Duplicate navigation attempt blocked:', url);
      return false;
    }

    setIsNavigating(true);
    lastNavigationRef.current = url;

    // Clear any existing timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    // Navigate
    if (options?.replace) {
      router.replace(url);
    } else {
      router.push(url);
    }

    // Reset navigation state after a delay
    navigationTimeoutRef.current = setTimeout(() => {
      setIsNavigating(false);
    }, 500);

    return true;
  }, [isNavigating, router]);

  return { 
    safeNavigate, 
    isNavigating 
  };
}