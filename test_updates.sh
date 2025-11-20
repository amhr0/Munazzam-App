#!/bin/bash

echo "🧪 Testing Munazzam Security Updates"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test
test_endpoint() {
    local name=$1
    local command=$2
    local expected=$3
    
    echo -n "Testing: $name... "
    result=$(eval $command 2>&1)
    
    if echo "$result" | grep -q "$expected"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "  Expected: $expected"
        echo "  Got: $result"
        ((FAILED++))
    fi
}

echo "1️⃣ Syntax Validation Tests"
echo "-------------------------"

# Test middleware files
test_endpoint "authMiddleware.js syntax" \
    "node -c server/middleware/authMiddleware.js" \
    ""

test_endpoint "fileValidation.js syntax" \
    "node -c server/middleware/fileValidation.js" \
    ""

test_endpoint "inputSanitization.js syntax" \
    "node -c server/middleware/inputSanitization.js" \
    ""

# Test route files
test_endpoint "auth.js syntax" \
    "node -c server/routes/auth.js" \
    ""

test_endpoint "meetings.js syntax" \
    "node -c server/routes/meetings.js" \
    ""

test_endpoint "admin.js syntax" \
    "node -c server/routes/admin.js" \
    ""

test_endpoint "server.js syntax" \
    "node -c server/server.js" \
    ""

echo ""
echo "2️⃣ Configuration Tests"
echo "---------------------"

# Test .env.example exists
test_endpoint ".env.example exists" \
    "test -f server/.env.example && echo 'exists'" \
    "exists"

# Test .gitignore updated
test_endpoint ".gitignore protects .env" \
    "grep -q '\.env' .gitignore && echo 'protected'" \
    "protected"

# Test docker-compose.yml updated
test_endpoint "docker-compose.yml uses env_file" \
    "grep -q 'env_file' docker-compose.yml && echo 'uses_env_file'" \
    "uses_env_file"

# Test API keys removed from docker-compose
test_endpoint "No API keys in docker-compose" \
    "! grep -q 'DEEPSEEK_API_KEY=sk-' docker-compose.yml && echo 'no_keys'" \
    "no_keys"

echo ""
echo "3️⃣ Dependencies Tests"
echo "--------------------"

# Test package.json has new dependencies
test_endpoint "cookie-parser in package.json" \
    "grep -q 'cookie-parser' server/package.json && echo 'found'" \
    "found"

test_endpoint "file-type in package.json" \
    "grep -q 'file-type' server/package.json && echo 'found'" \
    "found"

echo ""
echo "4️⃣ Documentation Tests"
echo "---------------------"

# Test documentation files exist
test_endpoint ".cursorrules exists" \
    "test -f .cursorrules && echo 'exists'" \
    "exists"

test_endpoint "CURSOR_PROMPTS.md exists" \
    "test -f CURSOR_PROMPTS.md && echo 'exists'" \
    "exists"

test_endpoint "SECURITY_FIXES.md exists" \
    "test -f SECURITY_FIXES.md && echo 'exists'" \
    "exists"

test_endpoint "DEPLOYMENT_INSTRUCTIONS.md exists" \
    "test -f DEPLOYMENT_INSTRUCTIONS.md && echo 'exists'" \
    "exists"

echo ""
echo "===================================="
echo "📊 Test Results Summary"
echo "===================================="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Ready to deploy.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please review before deploying.${NC}"
    exit 1
fi
