#!/bin/bash
# TypeScript Type Checking Script
# Runs strict type checking on Angular project

set -e

echo "Running TypeScript type check..."

# Check if tsc is available
if ! command -v npx &> /dev/null; then
    echo "Error: npx not found. Install Node.js first."
    exit 1
fi

# Run type check without emitting
npx tsc --noEmit --project tsconfig.json

# Check for any type errors
if [ $? -eq 0 ]; then
    echo "Type check passed successfully!"
else
    echo "Type errors found. Please fix them before committing."
    exit 1
fi
