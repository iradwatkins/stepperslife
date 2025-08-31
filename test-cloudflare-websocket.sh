#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 CLOUDFLARE WEBSOCKET VERIFICATION SCRIPT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Domain to test
DOMAIN="stepperslife.com"

echo "Testing domain: $DOMAIN"
echo ""

# Step 1: Check if Cloudflare is active
echo "1️⃣  Checking Cloudflare Proxy Status..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check for Cloudflare headers
CF_RAY=$(curl -s -I https://$DOMAIN 2>/dev/null | grep -i "cf-ray" | cut -d' ' -f2)
if [ ! -z "$CF_RAY" ]; then
    echo -e "${GREEN}✅ Cloudflare Active${NC}"
    echo "   CF-Ray ID: $CF_RAY"
else
    echo -e "${RED}❌ Cloudflare NOT Active${NC}"
    echo "   Domain may not be proxied through Cloudflare"
    echo "   Check your DNS settings in Cloudflare dashboard"
fi

# Check for Cloudflare IPs
echo ""
RESOLVED_IP=$(dig +short $DOMAIN | head -1)
if [[ $RESOLVED_IP == 104.* ]] || [[ $RESOLVED_IP == 172.* ]] || [[ $RESOLVED_IP == 162.* ]] || [[ $RESOLVED_IP == 198.* ]]; then
    echo -e "${GREEN}✅ DNS Resolves to Cloudflare${NC}"
    echo "   IP: $RESOLVED_IP"
else
    echo -e "${YELLOW}⚠️  DNS May Not Be Using Cloudflare${NC}"
    echo "   IP: $RESOLVED_IP"
    echo "   Expected Cloudflare IP ranges: 104.x, 172.x, 162.x, 198.x"
fi

echo ""
echo "2️⃣  Testing API Endpoint..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test the Convex API endpoint
API_RESPONSE=$(curl -s https://$DOMAIN/api/test-convex 2>/dev/null)
if echo "$API_RESPONSE" | grep -q "success.*true"; then
    EVENT_COUNT=$(echo "$API_RESPONSE" | grep -o '"eventCount":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}✅ API Endpoint Working${NC}"
    echo "   Events in database: $EVENT_COUNT"
else
    echo -e "${RED}❌ API Endpoint Failed${NC}"
    echo "   Response: $(echo "$API_RESPONSE" | head -100)"
fi

echo ""
echo "3️⃣  Testing WebSocket Headers..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test WebSocket upgrade headers
WS_HEADERS=$(curl -s -I -H "Connection: Upgrade" -H "Upgrade: websocket" https://$DOMAIN 2>/dev/null)
if echo "$WS_HEADERS" | grep -qi "upgrade"; then
    echo -e "${GREEN}✅ WebSocket Headers Supported${NC}"
    echo "$WS_HEADERS" | grep -i upgrade
else
    echo -e "${YELLOW}⚠️  WebSocket Headers Not Detected${NC}"
    echo "   This might be normal - test in browser for confirmation"
fi

echo ""
echo "4️⃣  Checking SSL Certificate..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check SSL certificate
SSL_ISSUER=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -issuer 2>/dev/null | grep -o "O = .*" | cut -d'=' -f2 | xargs)
if [[ "$SSL_ISSUER" == *"Cloudflare"* ]]; then
    echo -e "${GREEN}✅ Using Cloudflare SSL${NC}"
    echo "   Issuer: $SSL_ISSUER"
elif [[ "$SSL_ISSUER" == *"Let's Encrypt"* ]]; then
    echo -e "${YELLOW}⚠️  Using Let's Encrypt SSL${NC}"
    echo "   Issuer: $SSL_ISSUER"
    echo "   (Cloudflare may be in DNS-only mode)"
else
    echo -e "${YELLOW}⚠️  Unknown SSL Issuer${NC}"
    echo "   Issuer: $SSL_ISSUER"
fi

echo ""
echo "5️⃣  Testing Convex WebSocket URL..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test direct connection to Convex
CONVEX_URL="https://youthful-porcupine-760.convex.cloud"
CONVEX_RESPONSE=$(curl -s -I $CONVEX_URL 2>/dev/null | head -1)
if echo "$CONVEX_RESPONSE" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Convex Backend Accessible${NC}"
    echo "   URL: $CONVEX_URL"
else
    echo -e "${RED}❌ Cannot Reach Convex Backend${NC}"
    echo "   This might be a network issue"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Summary and recommendations
if [ ! -z "$CF_RAY" ] && [ ! -z "$EVENT_COUNT" ]; then
    echo -e "${GREEN}✅ CLOUDFLARE IS ACTIVE & API IS WORKING${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Visit https://$DOMAIN in your browser"
    echo "2. Open browser console (F12)"
    echo "3. Look for 'Convex Configuration' log"
    echo "4. Check Network tab for WS (WebSocket) connections"
    echo ""
    echo "If events still don't display:"
    echo "- Enable WebSockets in Cloudflare Network settings"
    echo "- Try 'Flexible' SSL mode in Cloudflare"
    echo "- Purge Cloudflare cache"
elif [ ! -z "$CF_RAY" ]; then
    echo -e "${YELLOW}⚠️  CLOUDFLARE ACTIVE BUT API ISSUES${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check if Docker containers are running on server"
    echo "2. Verify SSL/TLS mode in Cloudflare (try Flexible)"
    echo "3. Check Cloudflare Firewall rules"
else
    echo -e "${RED}❌ CLOUDFLARE NOT DETECTED${NC}"
    echo ""
    echo "Setup Required:"
    echo "1. Add domain to Cloudflare"
    echo "2. Update nameservers at domain registrar"
    echo "3. Set DNS records to 'Proxied' (orange cloud)"
    echo "4. Enable WebSockets in Network settings"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Quick Fixes:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "• Orange Cloud: Ensure DNS records show orange cloud ☁️"
echo "• WebSockets: Network tab → WebSockets → ON"
echo "• SSL Mode: SSL/TLS → Overview → Flexible or Full"
echo "• Cache: Caching → Configuration → Purge Everything"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"