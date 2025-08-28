"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';

const SingleEventFlow = dynamic(
  () => import('@/components/events/SingleEventFlow'),
  { 
    ssr: false,
    loading: () => <div className="p-8 text-center">Loading event form...</div>
  }
);

const MultiDayEventFlow = dynamic(
  () => import('@/components/events/MultiDayEventFlow'),
  { 
    ssr: false,
    loading: () => <div className="p-8 text-center">Loading multi-day form...</div>
  }
);

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'testing' | 'passed' | 'failed';
  data?: any;
  error?: string;
}

export default function CompleteTestPage() {
  const [currentTest, setCurrentTest] = useState<'menu' | 'single' | 'single-tickets' | 'multi-day'>('menu');
  const [testResults, setTestResults] = useState<TestResult[]>([
    { id: 'save-date', name: 'Single Event - Save the Date', status: 'pending' },
    { id: 'single-tickets', name: 'Single Event - With Tickets', status: 'pending' },
    { id: 'multi-day', name: 'Multi-Day Event', status: 'pending' },
    { id: 'mobile', name: 'Mobile Responsiveness', status: 'pending' },
  ]);

  const updateTestResult = (id: string, status: TestResult['status'], data?: any, error?: string) => {
    setTestResults(prev => prev.map(test => 
      test.id === id ? { ...test, status, data, error } : test
    ));
  };

  const handleSingleEventComplete = (data: any) => {
    console.log('Single event completed:', data);
    
    if (data.event.isSaveTheDate) {
      updateTestResult('save-date', 'passed', data);
    } else if (data.event.isTicketed) {
      updateTestResult('single-tickets', 'passed', data);
    }
    
    alert('Event created successfully! Check the test results.');
    setCurrentTest('menu');
  };

  const handleMultiDayComplete = (data: any) => {
    console.log('Multi-day event completed:', data);
    updateTestResult('multi-day', 'passed', data);
    alert('Multi-day event created successfully!');
    setCurrentTest('menu');
  };

  const TestMenu = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Complete Event System Test</h2>
        <p className="text-gray-600 mb-8">
          Test all features of the SteppersLife event creation system
        </p>
      </div>

      <div className="space-y-4">
        {/* Test 1: Save the Date */}
        <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Test 1: Save the Date Event</h3>
              <p className="text-sm text-gray-600 mb-4">
                Create a single event with Save the Date option (no venue yet)
              </p>
              <div className="text-sm space-y-1">
                <p>✓ Save the Date checkbox on Step 1</p>
                <p>✓ Location fields hidden when checked</p>
                <p>✓ Door price only (no tickets)</p>
              </div>
            </div>
            <div className="ml-4">
              {testResults[0].status === 'passed' ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <Circle className="w-8 h-8 text-gray-400" />
              )}
            </div>
          </div>
          <button
            onClick={() => {
              updateTestResult('save-date', 'testing');
              setCurrentTest('single');
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            Start Test <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>

        {/* Test 2: Single Event with Tickets */}
        <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Test 2: Single Event with Tickets</h3>
              <p className="text-sm text-gray-600 mb-4">
                Create a single event with online ticket sales
              </p>
              <div className="text-sm space-y-1">
                <p>✓ Address form with city autocomplete</p>
                <p>✓ Ticket types with early bird pricing</p>
                <p>✓ Table configuration</p>
              </div>
            </div>
            <div className="ml-4">
              {testResults[1].status === 'passed' ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <Circle className="w-8 h-8 text-gray-400" />
              )}
            </div>
          </div>
          <button
            onClick={() => {
              updateTestResult('single-tickets', 'testing');
              setCurrentTest('single-tickets');
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            Start Test <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>

        {/* Test 3: Multi-Day Event */}
        <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Test 3: Multi-Day Event</h3>
              <p className="text-sm text-gray-600 mb-4">
                Create a multi-day festival with ticket bundles
              </p>
              <div className="text-sm space-y-1">
                <p>✓ Start and end date selection</p>
                <p>✓ Different locations per day</p>
                <p>✓ Ticket bundles with discounts</p>
              </div>
            </div>
            <div className="ml-4">
              {testResults[2].status === 'passed' ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <Circle className="w-8 h-8 text-gray-400" />
              )}
            </div>
          </div>
          <button
            onClick={() => {
              updateTestResult('multi-day', 'testing');
              setCurrentTest('multi-day');
            }}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center"
          >
            Start Test <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>

        {/* Test 4: Mobile Responsiveness */}
        <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Test 4: Mobile Responsiveness</h3>
              <p className="text-sm text-gray-600 mb-4">
                Verify mobile layout and functionality
              </p>
              <div className="text-sm space-y-1">
                <p>✓ Categories in 2 columns on mobile</p>
                <p>✓ Address fields stack vertically</p>
                <p>✓ Touch-friendly buttons</p>
              </div>
            </div>
            <div className="ml-4">
              {testResults[3].status === 'passed' ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <Circle className="w-8 h-8 text-gray-400" />
              )}
            </div>
          </div>
          <button
            onClick={() => {
              updateTestResult('mobile', 'passed');
              alert('Resize your browser window to test mobile responsiveness!');
            }}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
          >
            Mark as Tested <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Test Results Summary */}
      {testResults.some(t => t.status === 'passed') && (
        <div className="mt-8 p-6 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-4">Test Results Data:</h3>
          {testResults.filter(t => t.status === 'passed' && t.data).map(test => (
            <details key={test.id} className="mb-4">
              <summary className="cursor-pointer text-sm font-medium">
                {test.name} - View Data
              </summary>
              <pre className="mt-2 text-xs bg-white p-4 rounded overflow-auto">
                {JSON.stringify(test.data, null, 2)}
              </pre>
            </details>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {currentTest === 'menu' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <TestMenu />
          </div>
        )}

        {currentTest === 'single' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white">
              <h1 className="text-2xl font-bold">Test: Save the Date Event</h1>
              <p className="text-blue-100">Check the Save the Date box on Basic Info step</p>
            </div>
            <div className="p-6">
              <SingleEventFlow
                onComplete={handleSingleEventComplete}
                onCancel={() => setCurrentTest('menu')}
              />
            </div>
          </div>
        )}

        {currentTest === 'single-tickets' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white">
              <h1 className="text-2xl font-bold">Test: Single Event with Tickets</h1>
              <p className="text-blue-100">Create an event with online ticket sales</p>
            </div>
            <div className="p-6">
              <SingleEventFlow
                onComplete={handleSingleEventComplete}
                onCancel={() => setCurrentTest('menu')}
              />
            </div>
          </div>
        )}

        {currentTest === 'multi-day' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4 text-white">
              <h1 className="text-2xl font-bold">Test: Multi-Day Event</h1>
              <p className="text-purple-100">Create a festival spanning multiple days</p>
            </div>
            <div className="p-6">
              <MultiDayEventFlow
                onComplete={handleMultiDayComplete}
                onCancel={() => setCurrentTest('menu')}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}