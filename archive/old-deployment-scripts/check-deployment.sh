#!/bin/bash

# SteppersLife Deployment Verification Script
# Checks if the deployment is successful and running correct version

set -e

# Configuration
APP_URL="${1:-http://localhost:3000}"
EXPECTED_VERSION="3.1.0"
EXPECTED_FEE="1.50"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "================================================"
echo -e "${BLUE}SteppersLife Deployment Verification${NC}"
echo "================================================"
echo "Checking: $APP_URL"
echo "Expected Version: $EXPECTED_VERSION"
echo "Expected Fee: \$$EXPECTED_FEE per ticket"
echo "================================================"
echo ""

# Function to check endpoint
check_endpoint() {
    local url=$1
    local name=$2
    local expected=$3
    
    echo -n "Checking $name... "
    
    response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "301" ] || [ "$http_code" = "302" ]; then
        echo -e "${GREEN}✓${NC} (HTTP $http_code)"
        if [ ! -z "$expected" ]; then
            if echo "$body" | grep -q "$expected"; then
                echo -e "  └─ ${GREEN}Found: $expected${NC}"
            else
                echo -e "  └─ ${YELLOW}Warning: Expected '$expected' not found${NC}"
            fi
        fi
        return 0
    else
        echo -e "${RED}✗${NC} (HTTP $http_code)"
        return 1
    fi
}

# Check if site is accessible
echo "1. Basic Connectivity"
echo "--------------------"
if check_endpoint "$APP_URL" "Homepage" "SteppersLife"; then
    echo -e "  └─ ${GREEN}Site is accessible${NC}"
else
    echo -e "  └─ ${RED}Site is not accessible${NC}"
    exit 1
fi
echo ""

# Check version endpoint
echo "2. Version Check"
echo "----------------"
VERSION_RESPONSE=$(curl -s "$APP_URL/version" 2>/dev/null)
if [ ! -z "$VERSION_RESPONSE" ]; then
    CURRENT_VERSION=$(echo "$VERSION_RESPONSE" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
    PLATFORM_FEE=$(echo "$VERSION_RESPONSE" | grep -o '"platformFee":"[^"]*"' | cut -d'"' -f4)
    BUILD_DATE=$(echo "$VERSION_RESPONSE" | grep -o '"buildDate":"[^"]*"' | cut -d'"' -f4)
    
    echo -e "Current Version: ${BLUE}$CURRENT_VERSION${NC}"
    echo -e "Platform Fee: ${BLUE}$PLATFORM_FEE${NC}"
    echo -e "Build Date: ${BLUE}$BUILD_DATE${NC}"
    
    if [ "$CURRENT_VERSION" = "$EXPECTED_VERSION" ]; then
        echo -e "  └─ ${GREEN}✓ Version matches expected${NC}"
    else
        echo -e "  └─ ${RED}✗ Version mismatch! Expected $EXPECTED_VERSION${NC}"
    fi
    
    if echo "$PLATFORM_FEE" | grep -q "$EXPECTED_FEE"; then
        echo -e "  └─ ${GREEN}✓ Platform fee is correct${NC}"
    else
        echo -e "  └─ ${YELLOW}⚠ Platform fee mismatch${NC}"
    fi
else
    echo -e "${RED}Failed to get version information${NC}"
fi
echo ""

# Check health endpoint
echo "3. Health Check"
echo "---------------"
HEALTH_RESPONSE=$(curl -s "$APP_URL/health" 2>/dev/null)
if [ ! -z "$HEALTH_RESPONSE" ]; then
    STATUS=$(echo "$HEALTH_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    UPTIME=$(echo "$HEALTH_RESPONSE" | grep -o '"uptime":"[^"]*"' | cut -d'"' -f4)
    ENV=$(echo "$HEALTH_RESPONSE" | grep -o '"environment":"[^"]*"' | cut -d'"' -f4)
    
    if [ "$STATUS" = "healthy" ]; then
        echo -e "Status: ${GREEN}$STATUS${NC}"
    else
        echo -e "Status: ${RED}$STATUS${NC}"
    fi
    echo -e "Environment: ${BLUE}$ENV${NC}"
    echo -e "Uptime: ${BLUE}$UPTIME${NC}"
    
    # Check services
    echo ""
    echo "Services:"
    if echo "$HEALTH_RESPONSE" | grep -q '"database":"connected"'; then
        echo -e "  ├─ Database: ${GREEN}✓ connected${NC}"
    else
        echo -e "  ├─ Database: ${RED}✗ not connected${NC}"
    fi
    
    if echo "$HEALTH_RESPONSE" | grep -q '"convex":"configured"'; then
        echo -e "  ├─ Convex: ${GREEN}✓ configured${NC}"
    else
        echo -e "  ├─ Convex: ${YELLOW}⚠ not configured${NC}"
    fi
    
    if echo "$HEALTH_RESPONSE" | grep -q '"auth":"configured"'; then
        echo -e "  └─ Auth: ${GREEN}✓ configured${NC}"
    else
        echo -e "  └─ Auth: ${RED}✗ not configured${NC}"
    fi
else
    echo -e "${YELLOW}Health endpoint not available${NC}"
fi
echo ""

# Check Docker container (if local)
if [ "$APP_URL" = "http://localhost:3000" ]; then
    echo "4. Docker Container"
    echo "-------------------"
    if docker ps | grep -q "stepperslife"; then
        CONTAINER_ID=$(docker ps | grep "stepperslife" | awk '{print $1}')
        CONTAINER_NAME=$(docker ps | grep "stepperslife" | awk '{print $NF}')
        echo -e "Container: ${GREEN}✓ Running${NC}"
        echo -e "  ├─ ID: ${BLUE}$CONTAINER_ID${NC}"
        echo -e "  └─ Name: ${BLUE}$CONTAINER_NAME${NC}"
    else
        echo -e "Container: ${YELLOW}Not found or not running${NC}"
    fi
    echo ""
fi

# Check key features
echo "5. Feature Verification"
echo "-----------------------"
echo -n "Theme Toggle: "
HOMEPAGE=$(curl -s "$APP_URL" 2>/dev/null)
if echo "$HOMEPAGE" | grep -q "Toggle theme\|sun\|moon\|ThemeToggle"; then
    echo -e "${GREEN}✓ Present${NC}"
else
    echo -e "${RED}✗ Not found${NC}"
fi

echo -n "Payment Providers: "
if echo "$VERSION_RESPONSE" | grep -q "square.*stripe.*paypal"; then
    echo -e "${GREEN}✓ All configured${NC}"
else
    echo -e "${YELLOW}⚠ Some missing${NC}"
fi

# Summary
echo ""
echo "================================================"
echo -e "${BLUE}Deployment Summary${NC}"
echo "================================================"

ISSUES=0

if [ "$CURRENT_VERSION" != "$EXPECTED_VERSION" ]; then
    echo -e "${RED}✗ Version mismatch${NC}"
    ((ISSUES++))
fi

if ! echo "$PLATFORM_FEE" | grep -q "$EXPECTED_FEE"; then
    echo -e "${YELLOW}⚠ Platform fee incorrect${NC}"
    ((ISSUES++))
fi

if [ "$ISSUES" -eq 0 ]; then
    echo -e "${GREEN}✓ Deployment Successful!${NC}"
    echo "Version $EXPECTED_VERSION is running correctly."
else
    echo -e "${YELLOW}⚠ Deployment has $ISSUES issue(s)${NC}"
    echo "Please check the details above."
fi

echo "================================================"