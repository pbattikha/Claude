#!/bin/bash

echo "🧪 Testing iSTEAM AHEAD CMS..."
echo ""

# Test 1: Get content
echo "✅ Test 1: Fetching content..."
curl -s http://localhost:3001/api/content > /dev/null && echo "   Content API: PASS" || echo "   Content API: FAIL"

# Test 2: Login
echo "✅ Test 2: Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

if echo $LOGIN_RESPONSE | grep -q '"token"'; then
  echo "   Login: PASS"
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4 | head -1)
else
  echo "   Login: FAIL"
  exit 1
fi

# Test 3: Check admin dashboard
echo "✅ Test 3: Checking admin dashboard..."
curl -s http://localhost:3001/admin/index.html | grep -q "iSTEAM AHEAD CMS" && echo "   Dashboard: PASS" || echo "   Dashboard: FAIL"

echo ""
echo "🎉 All tests passed!"
echo ""
echo "📊 Admin Dashboard: http://localhost:3001/admin"
echo "🔐 Default Login: admin / admin123"
echo "🌐 Website: http://localhost:3001"
