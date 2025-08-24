"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function ThemeTest() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-primary">
          SteppersLife Theme Test Page
        </h1>
        
        <div className="p-4 bg-card rounded-lg border">
          <p className="text-lg mb-4">Current theme: <strong>{theme}</strong></p>
          <div className="flex gap-4">
            <button 
              onClick={() => setTheme("light")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded"
            >
              Light Theme
            </button>
            <button 
              onClick={() => setTheme("dark")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded"
            >
              Dark Theme
            </button>
            <button 
              onClick={() => setTheme("system")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded"
            >
              System Theme
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-primary text-primary-foreground rounded">
            <h3 className="font-bold">Primary</h3>
            <p className="text-sm opacity-75">Purple Theme</p>
          </div>
          
          <div className="p-4 bg-secondary text-secondary-foreground rounded">
            <h3 className="font-bold">Secondary</h3>
            <p className="text-sm opacity-75">Teal Theme</p>
          </div>
          
          <div className="p-4 bg-accent text-accent-foreground rounded">
            <h3 className="font-bold">Accent</h3>
            <p className="text-sm opacity-75">Gold Theme</p>
          </div>
          
          <div className="p-4 bg-success text-success-foreground rounded">
            <h3 className="font-bold">Success</h3>
            <p className="text-sm opacity-75">Green Theme</p>
          </div>
          
          <div className="p-4 bg-info text-info-foreground rounded">
            <h3 className="font-bold">Info</h3>
            <p className="text-sm opacity-75">Blue Theme</p>
          </div>
          
          <div className="p-4 bg-warning text-warning-foreground rounded">
            <h3 className="font-bold">Warning</h3>
            <p className="text-sm opacity-75">Orange Theme</p>
          </div>
          
          <div className="p-4 bg-destructive text-destructive-foreground rounded">
            <h3 className="font-bold">Destructive</h3>
            <p className="text-sm opacity-75">Red Theme</p>
          </div>
          
          <div className="p-4 bg-muted text-muted-foreground rounded">
            <h3 className="font-bold">Muted</h3>
            <p className="text-sm opacity-75">Gray Theme</p>
          </div>
        </div>

        <div className="p-6 bg-card border rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Theme Colors Active</h2>
          <p className="text-muted-foreground mb-4">
            This page demonstrates the SteppersLife brand colors.
          </p>
          <ul className="space-y-2">
            <li>✅ Primary: Deep Purple (#8B5CF6)</li>
            <li>✅ Secondary: Teal (#5EEAD4)</li>
            <li>✅ Accent: Gold (#FCD34D)</li>
            <li>✅ Success: Green</li>
            <li>✅ Info: Blue</li>
            <li>✅ Warning: Orange</li>
          </ul>
        </div>
      </div>
    </div>
  );
}