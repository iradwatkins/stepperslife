"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithCredentials } from "@/app/actions/signin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, Lock } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showClassicLogin, setShowClassicLogin] = useState(true);

  const handleClassicLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signInWithCredentials(email, password, callbackUrl);
      
      if (result?.error) {
        setError(result.error);
      } else {
        // Successful login - redirect will happen automatically
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Quick login helper for demo accounts
  const quickLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setIsLoading(true);
    setError("");

    try {
      const result = await signInWithCredentials(demoEmail, demoPassword, callbackUrl);
      
      if (result?.error) {
        setError(result.error);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">Welcome to SteppersLife</h1>
        <p className="text-gray-600 text-center mb-8">Sign in to continue</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Demo Accounts Quick Access */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
          <p className="text-sm font-medium text-blue-900 mb-3">Quick Access - Demo Accounts:</p>
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-sm"
              onClick={() => quickLogin("admin@stepperslife.com", "admin123")}
              disabled={isLoading}
            >
              <span className="font-medium">Admin:</span>&nbsp;admin@stepperslife.com
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-sm"
              onClick={() => quickLogin("test@example.com", "test123")}
              disabled={isLoading}
            >
              <span className="font-medium">Test:</span>&nbsp;test@example.com
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-sm"
              onClick={() => quickLogin("irawatkins@gmail.com", "demo123")}
              disabled={isLoading}
            >
              <span className="font-medium">Ira:</span>&nbsp;irawatkins@gmail.com
            </Button>
          </div>
        </div>

        {/* Manual Login Form */}
        <div className="mb-6">
          <button
            onClick={() => setShowClassicLogin(!showClassicLogin)}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors font-medium bg-gray-100 px-4 py-3 rounded-lg"
          >
            <Lock className="w-4 h-4" />
            Manual sign in
            <ChevronDown className={`w-4 h-4 transition-transform ${showClassicLogin ? 'rotate-180' : ''}`} />
          </button>

          {showClassicLogin && (
            <form onSubmit={handleClassicLogin} className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="default"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <a href="/auth/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}