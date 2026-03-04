#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}🧪 Testing Exact Location Features${NC}"
echo -e "${BLUE}================================${NC}\n"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test suite
run_test_suite() {
    local name=$1
    local pattern=$2
    
    echo -e "${YELLOW}Testing: $name${NC}"
    echo "Command: npm test -- $pattern"
    echo "---"
    
    if npm test -- "$pattern" --passWithNoTests 2>&1 | grep -q "Tests:.*passed"; then
        echo -e "${GREEN}✓ $name - PASSED${NC}\n"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}✗ $name - FAILED${NC}\n"
        ((FAILED_TESTS++))
    fi
    ((TOTAL_TESTS++))
}

# Run unit tests for specific files
echo -e "${BLUE}1️⃣  Unit Tests for Components${NC}\n"
run_test_suite "ExactLocationManager" "components/__tests__/exact-location-manager.test.tsx"
run_test_suite "ExactLocationMapView" "components/__tests__/exact-location-map-view.test.tsx"

echo -e "${BLUE}2️⃣  Unit Tests for Services${NC}\n"
run_test_suite "VenuesService.updateExactLocation" "lib/services/__tests__/venues.service.updateExactLocation.test.ts"

echo -e "${BLUE}3️⃣  Integration Tests${NC}\n"
run_test_suite "ExactLocationSaving Integration" "lib/__tests__/exact-location-saving.integration.test.ts"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}📊 Test Summary${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "Total Test Suites: ${TOTAL_TESTS}"
echo -e "Passed: ${GREEN}${PASSED_TESTS}${NC}"
echo -e "Failed: ${RED}${FAILED_TESTS}${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}✗ Some tests failed${NC}"
    exit 1
fi
