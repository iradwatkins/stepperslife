#!/bin/bash

echo "==================================="
echo "SteppersLife Event Organizer Tests"
echo "==================================="
echo ""

# Load test environment variables
if [ -f .env.test ]; then
  export $(cat .env.test | grep -v '^#' | xargs)
  echo "✅ Test environment loaded"
else
  echo "⚠️  .env.test not found, using defaults"
fi

# Create directories for test artifacts
mkdir -p tests/screenshots
mkdir -p tests/reports
mkdir -p playwright-report

echo ""
echo "🎯 Target URL: ${TEST_BASE_URL:-https://stepperslife.com}"
echo ""

# Install Playwright browsers if needed
echo "📦 Ensuring Playwright browsers are installed..."
npx playwright install chromium

echo ""
echo "🧪 Running event organizer walkthrough tests..."
echo ""

# Run the comprehensive test suite
npx playwright test event-organizer-walkthrough.spec.ts \
  --reporter=list \
  --reporter=html \
  --reporter=json

# Capture exit code
TEST_EXIT_CODE=$?

echo ""
echo "==================================="
echo "Test Results Summary"
echo "==================================="

if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "✅ All tests passed successfully!"
else
  echo "❌ Some tests failed. Check the report for details."
fi

echo ""
echo "📊 Reports generated:"
echo "   - HTML Report: playwright-report/index.html"
echo "   - JSON Report: test-results.json"
echo "   - Screenshots: tests/screenshots/"
echo "   - Videos: test-results/"
echo ""

# Open HTML report if not in CI
if [ -z "$CI" ]; then
  echo "Opening HTML report in browser..."
  npx playwright show-report
fi

exit $TEST_EXIT_CODE