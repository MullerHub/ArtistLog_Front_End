#!/bin/bash

# ============================================
# API Connectivity Test
# ============================================

API_URL="${NEXT_PUBLIC_API_URL:-https://artistlog-backend-latest.onrender.com}"

echo "🔍 Testing API Connectivity"
echo "📍 Target API: $API_URL"
echo ""

# Test 1: Basic connectivity
echo "1️⃣  Testing basic connectivity..."
if curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" | grep -q "200\|404\|500"; then
  echo "✅ Backend is reachable"
else
  echo "❌ Backend is NOT reachable"
  exit 1
fi
echo ""

# Test 2: Health endpoint
echo "2️⃣  Testing /health endpoint..."
HEALTH=$(curl -s "$API_URL/health")
echo "Response: $HEALTH"
echo ""

# Test 3: CORS headers
echo "3️⃣  Testing CORS headers..."
CORS_RESPONSE=$(curl -s -I -X OPTIONS "$API_URL/api/artists" \
  -H "Origin: https://vercel-deployment.vercel.app" \
  -H "Access-Control-Request-Method: GET")
echo "$CORS_RESPONSE" | grep -i "access-control"
echo ""

# Test 4: API authentication endpoint
echo "4️⃣  Testing /api/auth/login endpoint..."
AUTH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}')
HTTP_CODE=$(echo "$AUTH_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$AUTH_RESPONSE" | sed '$d')
echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"
echo ""

# Test 5: Sample data endpoint
echo "5️⃣  Testing /api/venues endpoint..."
VENUES=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$API_URL/api/venues?limit=1")
HTTP_CODE=$(echo "$VENUES" | grep "HTTP_CODE:" | cut -d: -f2)
echo "HTTP Status: $HTTP_CODE"
echo ""

# Summary
echo "✅ Diagnostic complete!"
echo ""
echo "🔧 Environment:"
echo "  Frontend URL: Should be on Vercel"
echo "  Backend URL: $API_URL"
echo ""
echo "📝 Next steps:"
echo "  1. Verify backend is running on Render"
echo "  2. Check Vercel dashboard environment variables"
echo "  3. Check browser console for CORS errors"
echo "  4. Check Render logs: https://dashboard.render.com"
