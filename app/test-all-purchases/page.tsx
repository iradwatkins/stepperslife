"use client";

import TestAllPurchases from "@/components/TestAllPurchases";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function TestAllPurchasesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link href="/test-purchase">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Test Purchase
              </Button>
            </Link>
          </div>
          <Link href="/tickets">
            <Button variant="outline">
              View Tickets Dashboard
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Test Suite
          </h1>
          <p className="text-gray-600">
            Test all 4 ticket purchase types with a single click
          </p>
        </div>

        {/* Main Component */}
        <TestAllPurchases />
      </div>
    </div>
  );
}