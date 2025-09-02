import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

/**
 * Higher-Order Component that protects pages requiring authentication
 * Automatically redirects to sign-in if user is not authenticated
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    redirectTo?: string;
    loadingComponent?: React.ReactNode;
  }
) {
  const redirectTo = options?.redirectTo || "/sign-in";
  const LoadingComponent = options?.loadingComponent || DefaultLoadingComponent;

  return function AuthenticatedComponent(props: P) {
    const { isSignedIn, isLoaded } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (isLoaded && !isSignedIn) {
        // Encode the current path as a redirect URL
        const currentPath = window.location.pathname + window.location.search;
        const redirectUrl = encodeURIComponent(currentPath);
        router.push(`${redirectTo}?redirect_url=${redirectUrl}`);
      }
    }, [isSignedIn, isLoaded, router]);

    // Show loading state while auth is being checked
    if (!isLoaded) {
      return <>{LoadingComponent}</>;
    }

    // Don't render the component if not signed in
    if (!isSignedIn) {
      return <>{LoadingComponent}</>;
    }

    // Render the protected component
    return <Component {...props} />;
  };
}

/**
 * Default loading component shown while auth is being checked
 */
function DefaultLoadingComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  );
}

/**
 * Hook version for components that need auth but handle their own loading/redirect
 */
export function useAuthRequired(redirectTo = "/sign-in") {
  const { isSignedIn, isLoaded, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      const currentPath = window.location.pathname + window.location.search;
      const redirectUrl = encodeURIComponent(currentPath);
      router.push(`${redirectTo}?redirect_url=${redirectUrl}`);
    }
  }, [isSignedIn, isLoaded, router, redirectTo]);

  return {
    isAuthenticated: isSignedIn,
    isLoading: !isLoaded,
    user,
  };
}