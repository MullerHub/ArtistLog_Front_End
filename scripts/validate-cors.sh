#!/bin/bash

# ============================================
# Validar CORS Fix
# ============================================

BACKEND_URL="https://artistlog-backend-latest.onrender.com"
FRONTEND_URL="${1:-https://artistlog.vercel.app}"

echo "🔍 CORS Validation Test"
echo "📍 Frontend: $FRONTEND_URL"
echo "📍 Backend:  $BACKEND_URL"
echo ""

# Test CORS preflight com Origin da Vercel
echo "1️⃣  Testing CORS preflight from frontend..."
PREFLIGHT=$(curl -s -I -X OPTIONS "$BACKEND_URL/artists" \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: GET")

echo "$PREFLIGHT" | grep -i "access-control-allow-origin" && echo "✅ CORS origin accepted" || echo "❌ CORS origin BLOCKED"
echo ""

# Test actual request
echo "2️⃣  Testing actual requests..."

# Test /artists
ARTISTS=$(curl -s -w "\nHTTP:%{http_code}" "$BACKEND_URL/artists")
HTTP_CODE=$(echo "$ARTISTS" | grep "HTTP:" | cut -d: -f2)
echo "GET /artists: HTTP $HTTP_CODE ✅"

# Test /venues  
VENUES=$(curl -s -w "\nHTTP:%{http_code}" "$BACKEND_URL/venues")
HTTP_CODE=$(echo "$VENUES" | grep "HTTP:" | cut -d: -f2)
echo "GET /venues:  HTTP $HTTP_CODE ✅"

# Test /auth/login (deve dar erro de auth, mas não CORS)
LOGIN=$(curl -s -w "\nHTTP:%{http_code}" -X POST "$BACKEND_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}')
HTTP_CODE=$(echo "$LOGIN" | grep "HTTP:" | cut -d: -f2)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "400" ]; then
  echo "POST /auth/login: HTTP $HTTP_CODE ✅ (CORS allowed)"
else
  echo "POST /auth/login: HTTP $HTTP_CODE ⚠️"
fi

echo ""
echo "✅ If all above show ✅ or 40x codes (not CORS), CORS is fixed!"
echo ""
echo "📝 Next: Reload frontend in browser and check Network tab"
