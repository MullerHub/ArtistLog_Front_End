#!/bin/bash

# ============================================
# Diagnostic - Full API Connection Test
# ============================================

BACKEND_URL="https://artistlog-backend-latest.onrender.com"
FRONTEND_URL="https://artist-log-front-end.vercel.app"

echo "🔍 FULL DIAGNOSTIC - API Connection Test"
echo "========================================"
echo ""

# 1. Backend Health
echo "1️⃣ Backend Health Check"
echo "URL: $BACKEND_URL/health"
HEALTH=$(curl -s -w "\nHTTP:%{http_code}" "$BACKEND_URL/health")
HTTP_CODE=$(echo "$HEALTH" | grep "HTTP:" | cut -d: -f2)
BODY=$(echo "$HEALTH" | sed '$d')
echo "Status: $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Backend is ONLINE"
  echo "Response: $BODY"
else
  echo "❌ Backend is DOWN or unreachable"
fi
echo ""

# 2. CORS Preflight for /artists
echo "2️⃣ CORS Preflight Test (GET /artists)"
echo "Origin: $FRONTEND_URL"
CORS=$(curl -s -I -X OPTIONS "$BACKEND_URL/artists" \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: content-type")

ALLOW_ORIGIN=$(echo "$CORS" | grep -i "access-control-allow-origin" | head -1)
ALLOW_METHODS=$(echo "$CORS" | grep -i "access-control-allow-methods" | head -1)

if [ ! -z "$ALLOW_ORIGIN" ]; then
  echo "✅ CORS Headers Found:"
  echo "   $ALLOW_ORIGIN"
  echo "   $ALLOW_METHODS"
else
  echo "❌ NO CORS headers found - Backend CORS not configured correctly"
fi
echo ""

# 3. Test /artists endpoint
echo "3️⃣ Actual Request Test (GET /artists)"
ARTISTS=$(curl -s -w "\nHTTP:%{http_code}" "$BACKEND_URL/artists")
HTTP_CODE=$(echo "$ARTISTS" | grep "HTTP:" | cut -d: -f2)
echo "Status: $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ /artists endpoint works"
  SAMPLE=$(echo "$ARTISTS" | sed '$d' | head -c 200)
  echo "Sample: $SAMPLE..."
else
  echo "❌ /artists endpoint failed"
fi
echo ""

# 4. Test /auth/login endpoint
echo "4️⃣ Auth Endpoint Test (POST /auth/login)"
LOGIN=$(curl -s -w "\nHTTP:%{http_code}" -X POST "$BACKEND_URL/auth/login" \
  -H "Content-Type: application/json" \
  -H "Origin: $FRONTEND_URL" \
  -d '{"email":"test@test.com","password":"test"}')
HTTP_CODE=$(echo "$LOGIN" | grep "HTTP:" | cut -d: -f2)
echo "Status: $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "400" ]; then
  echo "✅ /auth/login endpoint accessible"
else
  echo "⚠️  /auth/login returned: $HTTP_CODE"
fi
echo ""

# 5. Test /venues endpoint
echo "5️⃣ Venues Endpoint Test (GET /venues)"
VENUES=$(curl -s -w "\nHTTP:%{http_code}" "$BACKEND_URL/venues")
HTTP_CODE=$(echo "$VENUES" | grep "HTTP:" | cut -d: -f2)
echo "Status: $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ /venues endpoint works"
else
  echo "⚠️  /venues endpoint returned: $HTTP_CODE"
fi
echo ""

# Summary
echo "========================================"
echo "✅ SUMMARY & NEXT STEPS"
echo ""
echo "If all tests show ✅:"
echo "  → Problem is in frontend code"
echo "  → Check browser DevTools (F12) Console tab"
echo "  → Look for specific error messages"
echo ""
echo "If any tests show ❌:"
echo "  → Backend configuration needs fixing"
echo "  → Contact backend developer"
echo ""
echo "📝 Check these common issues:"
echo "  1. CORS_ALLOWED_ORIGINS has your Vercel domain?"
echo "  2. Backend is actually running (check Render dashboard)"
echo "  3. Network request shows in DevTools Network tab?"
echo "  4. Response has Access-Control-Allow-Origin header?"
