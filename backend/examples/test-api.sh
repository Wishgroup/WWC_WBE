#!/bin/bash

# Wish Waves Club Backend API Test Script
# Make sure server is running: npm run dev

BASE_URL="http://localhost:3001"
VENDOR_API_KEY="VENDOR001"
ADMIN_API_KEY="your_admin_api_key"  # Update this with your actual admin API key

echo "🧪 Testing Wish Waves Club Backend API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Health Check
echo "1️⃣  Health Check"
echo "   GET $BASE_URL/health"
curl -s "$BASE_URL/health" | jq '.'
echo ""
echo ""

# Test 2: NFC Validation (Valid Card)
echo "2️⃣  NFC Validation - Valid Card"
echo "   POST $BASE_URL/api/nfc/validate"
curl -s -X POST "$BASE_URL/api/nfc/validate" \
  -H "Content-Type: application/json" \
  -H "X-Vendor-API-Key: $VENDOR_API_KEY" \
  -d '{
    "cardUid": "CARD123456789",
    "posReaderId": "POS001",
    "latitude": 25.2048,
    "longitude": 55.2708,
    "transactionAmount": 100.00
  }' | jq '.'
echo ""
echo ""

# Test 3: NFC Validation (Invalid Card)
echo "3️⃣  NFC Validation - Invalid Card"
echo "   POST $BASE_URL/api/nfc/validate"
curl -s -X POST "$BASE_URL/api/nfc/validate" \
  -H "Content-Type: application/json" \
  -H "X-Vendor-API-Key: $VENDOR_API_KEY" \
  -d '{
    "cardUid": "INVALID_CARD",
    "posReaderId": "POS001",
    "latitude": 25.2048,
    "longitude": 55.2708
  }' | jq '.'
echo ""
echo ""

# Test 4: Admin - Fraud Logs
echo "4️⃣  Admin API - Fraud Logs"
echo "   GET $BASE_URL/api/admin/fraud/logs"
curl -s -X GET "$BASE_URL/api/admin/fraud/logs" \
  -H "X-Admin-API-Key: $ADMIN_API_KEY" | jq '.'
echo ""
echo ""

# Test 5: Admin - Fraud Stats
echo "5️⃣  Admin API - Fraud Statistics"
echo "   GET $BASE_URL/api/admin/fraud/stats"
curl -s -X GET "$BASE_URL/api/admin/fraud/stats" \
  -H "X-Admin-API-Key: $ADMIN_API_KEY" | jq '.'
echo ""
echo ""

# Test 6: Admin - Blocked Cards
echo "6️⃣  Admin API - Blocked Cards"
echo "   GET $BASE_URL/api/admin/cards/blocked"
curl -s -X GET "$BASE_URL/api/admin/cards/blocked" \
  -H "X-Admin-API-Key: $ADMIN_API_KEY" | jq '.'
echo ""
echo ""

# Test 7: Admin - Vendor Analytics
echo "7️⃣  Admin API - Vendor Analytics"
echo "   GET $BASE_URL/api/admin/vendors/analytics"
curl -s -X GET "$BASE_URL/api/admin/vendors/analytics" \
  -H "X-Admin-API-Key: $ADMIN_API_KEY" | jq '.'
echo ""
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ API tests completed!"
echo ""
echo "💡 Note: Update ADMIN_API_KEY in this script with your actual key"





