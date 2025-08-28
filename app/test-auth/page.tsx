"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function TestAuthPage() {
  const { data: session, status } = useSession();

  const testLogin = async (email: string, password: string) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        console.error("Login failed:", result.error);
      } else {
        console.log("Login successful:", result);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Session Status</h2>
        <p><strong>Status:</strong> {status}</p>
        
        <h2 className="text-lg font-semibold mt-4 mb-2">Session Data</h2>
        <pre className="bg-white p-2 rounded text-sm overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Quick Test Login</h2>
        
        <div className="space-y-2 mb-4">
          <button
            onClick={() => testLogin("test@example.com", "test123")}
            className="block w-full text-left p-2 bg-blue-50 hover:bg-blue-100 rounded border"
          >
            <div className="font-medium">Test User</div>
            <div className="text-sm text-gray-600">test@example.com / test123</div>
          </button>
          
          <button
            onClick={() => testLogin("admin@stepperslife.com", "admin123")}
            className="block w-full text-left p-2 bg-blue-50 hover:bg-blue-100 rounded border"
          >
            <div className="font-medium">Admin User</div>
            <div className="text-sm text-gray-600">admin@stepperslife.com / admin123</div>
          </button>
          
          <button
            onClick={() => testLogin("irawatkins@gmail.com", "demo123")}
            className="block w-full text-left p-2 bg-blue-50 hover:bg-blue-100 rounded border"
          >
            <div className="font-medium">Ira Watkins (Admin)</div>
            <div className="text-sm text-gray-600">irawatkins@gmail.com / demo123</div>
          </button>
        </div>
        
        <div className="flex gap-2">
          <a href="/auth/signin" className="bg-blue-500 text-white px-4 py-2 rounded">
            Go to Sign In Page
          </a>
          
          {session && (
            <button
              onClick={() => signOut()}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}