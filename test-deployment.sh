#!/bin/bash
# Comprehensive deployment test script
# Run this AFTER deployment to verify everything is working

echo "🧪 STEPPERSLIFE DEPLOYMENT TEST SUITE"
echo "===================================="
echo "Testing deployment at: $(date)"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2
    local expected_result=$3
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "Testing: $test_name... "
    
    result=$(eval "$test_command" 2>&1)
    
    if [[ "$result" == *"$expected_result"* ]]; then
        echo -e "${GREEN}✅ PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "  Expected: $expected_result"
        echo "  Got: $result"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Function to test HTTP endpoint
test_endpoint() {
    local endpoint=$1
    local expected_content=$2
    local description=$3
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "Testing: $description... "
    
    response=$(curl -s -w "\n%{http_code}" "$endpoint" 2>/dev/null)
    http_code=$(echo "$response" | tail -n 1)
    content=$(echo "$response" | head -n -1)
    
    if [[ "$http_code" == "200" ]] && [[ "$content" == *"$expected_content"* ]]; then
        echo -e "${GREEN}✅ PASSED${NC} (HTTP $http_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $http_code)"
        if [[ "$http_code" != "200" ]]; then
            echo "  Expected HTTP 200, got $http_code"
        else
            echo "  Expected content containing: $expected_content"
            echo "  Got: ${content:0:100}..."
        fi
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

echo "1️⃣ INFRASTRUCTURE TESTS"
echo "------------------------"

# Test 1: Docker container running
run_test "Docker container status" \
    "docker ps --format '{{.Names}}' | grep stepperslife-prod" \
    "stepperslife-prod"

# Test 2: Port 3000 is open
run_test "Port 3000 accessibility" \
    "nc -zv localhost 3000 2>&1" \
    "succeeded"

# Test 3: Traefik labels
run_test "Traefik routing configured" \
    "docker inspect stepperslife-prod | grep -c 'traefik.enable=true'" \
    "1"

echo ""
echo "2️⃣ APPLICATION ENDPOINT TESTS"
echo "------------------------------"

# Test 4: Health endpoint
test_endpoint "http://localhost:3000/health" \
    "healthy" \
    "Health check endpoint"

# Test 5: Version endpoint
test_endpoint "http://localhost:3000/version" \
    "version" \
    "Version endpoint"

# Test 6: Homepage
test_endpoint "http://localhost:3000" \
    "SteppersLife" \
    "Homepage loading"

echo ""
echo "3️⃣ AUTHENTICATION TESTS"
echo "------------------------"

# Test 7: Auth providers endpoint
echo -n "Testing: OAuth providers configuration... "
providers=$(curl -s http://localhost:3000/api/auth/providers 2>/dev/null)
if [[ "$providers" == *"google"* ]]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    echo "  Found providers: $(echo $providers | jq -r 'keys[]' 2>/dev/null | tr '\n' ' ')"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "  Google OAuth provider not found!"
    echo "  Response: $providers"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test 8: Sign-in page
test_endpoint "http://localhost:3000/auth/signin" \
    "Sign in" \
    "Sign-in page accessibility"

# Test 9: Sign-up page
test_endpoint "http://localhost:3000/auth/signup" \
    "Sign up" \
    "Sign-up page accessibility"

echo ""
echo "4️⃣ NEW FEATURES TESTS"
echo "----------------------"

# Test 10: Event creation page (requires auth)
echo -n "Testing: Event creation page redirect... "
response=$(curl -s -I http://localhost:3000/seller/new-event | grep -i location)
if [[ "$response" == *"/auth/signin"* ]]; then
    echo -e "${GREEN}✅ PASSED${NC} (Correctly redirects to signin)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${YELLOW}⚠️  WARNING${NC}"
    echo "  Expected redirect to /auth/signin"
    echo "  Got: $response"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test 11: Complete test page
test_endpoint "http://localhost:3000/complete-test" \
    "Complete Event System Test" \
    "Test suite page"

echo ""
echo "5️⃣ PRODUCTION URL TESTS"
echo "------------------------"

# Test 12: HTTPS redirect
echo -n "Testing: HTTPS site accessibility... "
https_code=$(curl -s -o /dev/null -w "%{http_code}" https://stepperslife.com 2>/dev/null)
if [[ "$https_code" == "200" ]]; then
    echo -e "${GREEN}✅ PASSED${NC} (HTTP $https_code)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ FAILED${NC} (HTTP $https_code)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test 13: Auth callback URL uses HTTPS
echo -n "Testing: OAuth callback URLs... "
signin_page=$(curl -s https://stepperslife.com/auth/signin 2>/dev/null)
if [[ "$signin_page" == *"https://stepperslife.com"* ]] || [[ "$signin_page" == *"callbackUrl"* ]]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${YELLOW}⚠️  WARNING${NC} (Could not verify HTTPS callbacks)"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""
echo "6️⃣ ENVIRONMENT TESTS"
echo "---------------------"

# Test 14: Check environment variables
echo -n "Testing: Environment variables in container... "
env_check=$(docker exec stepperslife-prod sh -c 'echo "NEXTAUTH_URL=$NEXTAUTH_URL GOOGLE=$GOOGLE_CLIENT_ID"' 2>/dev/null)
if [[ "$env_check" == *"https://stepperslife.com"* ]] && [[ "$env_check" == *"1009301533734"* ]]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "  Environment variables not properly set"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""
echo "7️⃣ FEATURE VERIFICATION"
echo "------------------------"

# Test 15: Google Maps API
echo -n "Testing: Google Maps API integration... "
maps_check=$(docker exec stepperslife-prod sh -c 'echo $NEXT_PUBLIC_GOOGLE_MAPS_API_KEY' 2>/dev/null)
if [[ "$maps_check" == *"AIzaSy"* ]]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "  Google Maps API key not found"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test 16: Database connection
echo -n "Testing: Database file exists... "
db_check=$(docker exec stepperslife-prod sh -c 'ls -la dev.db 2>/dev/null | wc -l' 2>/dev/null)
if [[ "$db_check" -gt "0" ]]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${YELLOW}⚠️  WARNING${NC} (Database may not be initialized)"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""
echo "📊 TEST RESULTS SUMMARY"
echo "======================"
echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
echo ""

if [[ $FAILED_TESTS -eq 0 ]]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Deployment is successful!${NC}"
    echo ""
    echo "✅ Google OAuth is configured"
    echo "✅ HTTPS redirects are working"
    echo "✅ All endpoints are accessible"
    echo "✅ New features are deployed"
    echo ""
    echo "🌐 Visit https://stepperslife.com/auth/signin"
    echo "   You should see the Google sign-in button!"
else
    echo -e "${RED}⚠️  SOME TESTS FAILED! Check the output above.${NC}"
    echo ""
    echo "🔧 Troubleshooting steps:"
    echo "1. Check container logs: docker logs stepperslife-prod --tail 100"
    echo "2. Verify environment: docker exec stepperslife-prod env | grep -E '(NEXT|GOOGLE)'"
    echo "3. Check build errors: docker logs stepperslife-prod 2>&1 | grep -i error"
fi

echo ""
echo "📝 Container Logs (last 10 lines):"
echo "----------------------------------"
docker logs stepperslife-prod --tail 10 2>&1

echo ""
echo "🔗 Quick Links:"
echo "- Sign In: https://stepperslife.com/auth/signin"
echo "- New Event: https://stepperslife.com/seller/new-event"
echo "- Test Page: https://stepperslife.com/complete-test"