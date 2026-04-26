#!/bin/bash
# Run Angular Tests with Coverage

echo "Running tests with coverage..."

ng test --no-watch --code-coverage --browsers=ChromeHeadless

# Check coverage threshold
COVERAGE=$(cat coverage/lcov-report/index.html | grep -oP 'Statements.*?(\d+\.\d+)%' | grep -oP '\d+\.\d+' | head -1)

echo "Coverage: $COVERAGE%"

if (( $(echo "$COVERAGE < 80" | bc -l) )); then
    echo "WARNING: Coverage below 80% threshold!"
    exit 1
fi

echo "Coverage check passed!"
