"use client";

import { useState } from "react";
import { signInWithCredentials } from "@/app/actions/signin";
import { useRouter } from "next/navigation";

export default function TestAuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@stepperslife.com");
  const [password, setPassword] = useState("admin123");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const res = await signInWithCredentials(email, password, "/dashboard");
      setResult(res || { success: true });
      
      if (!res?.error) {
        // Login successful - should redirect automatically
        console.log("Login successful!");
      }
    } catch (error: any) {
      console.error("Test error:", error);
      setResult({ error: error.message || "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>
      
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <button
          onClick={testLogin}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Login"}
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded ${result.error ? "bg-red-100" : "bg-green-100"}`}>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Demo Accounts:</h2>
        <ul className="space-y-1 text-sm">
          <li>• admin@stepperslife.com / admin123</li>
          <li>• test@example.com / test123</li>
          <li>• irawatkins@gmail.com / demo123</li>
        </ul>
      </div>
    </div>
  );
}