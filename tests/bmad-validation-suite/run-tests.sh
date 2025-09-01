#!/bin/bash

# BMAD Validation Test Suite Runner
# Run comprehensive validation tests for SteppersLife platform

echo "========================================="
echo "BMAD VALIDATION TEST SUITE"
echo "Non-destructive testing for SteppersLife"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if dev server is running
echo "Checking if dev server is running..."
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓ Dev server is running${NC}"
else
    echo -e "${YELLOW}⚠ Dev server not detected. Starting it...${NC}"
    npm run dev &
    DEV_PID=$!
    echo "Waiting for server to start..."
    sleep 10
fi

# Install Playwright if needed
if ! command -v playwright &> /dev/null; then
    echo "Installing Playwright..."
    npm install -D @playwright/test
    npx playwright install chromium
fi

# Run tests based on argument
if [ "$1" = "smoke" ]; then
    echo -e "\n${YELLOW}Running smoke tests only...${NC}"
    npx playwright test tests/bmad-validation-suite/00-smoke-tests.spec.ts --reporter=list
elif [ "$1" = "events" ]; then
    echo -e "\n${YELLOW}Running event tests...${NC}"
    npx playwright test tests/bmad-validation-suite/01-event-creation-flow.spec.ts --reporter=list
elif [ "$1" = "reseller" ]; then
    echo -e "\n${YELLOW}Running reseller tests...${NC}"
    npx playwright test tests/bmad-validation-suite/03-reseller-program.spec.ts --reporter=list
elif [ "$1" = "purchase" ]; then
    echo -e "\n${YELLOW}Running purchase tests...${NC}"
    npx playwright test tests/bmad-validation-suite/04-purchase-validation.spec.ts --reporter=list
elif [ "$1" = "dashboard" ]; then
    echo -e "\n${YELLOW}Running dashboard tests...${NC}"
    npx playwright test tests/bmad-validation-suite/05-organizer-dashboard.spec.ts --reporter=list
elif [ "$1" = "report" ]; then
    echo -e "\n${YELLOW}Running all tests with HTML report...${NC}"
    npx playwright test tests/bmad-validation-suite --reporter=html
    echo -e "${GREEN}Opening HTML report...${NC}"
    npx playwright show-report
else
    echo -e "\n${YELLOW}Running all validation tests...${NC}"
    npx playwright test tests/bmad-validation-suite --reporter=list
fi

# Check exit code
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}=========================================${NC}"
    echo -e "${GREEN}✓ TESTS COMPLETED SUCCESSFULLY${NC}"
    echo -e "${GREEN}=========================================${NC}"
else
    echo -e "\n${RED}=========================================${NC}"
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo -e "${RED}Check test-results/screenshots for details${NC}"
    echo -e "${RED}=========================================${NC}"
fi

# Cleanup dev server if we started it
if [ ! -z "$DEV_PID" ]; then
    echo "Stopping dev server..."
    kill $DEV_PID 2>/dev/null
fi

echo ""
echo "Test artifacts saved in:"
echo "  • Screenshots: test-results/screenshots/"
echo "  • HTML Report: test-results/html-report/"
echo "  • JSON Results: test-results/results.json"
echo ""
echo "To view HTML report, run: npx playwright show-report"