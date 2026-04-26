#!/bin/bash
# Analyze Angular Routes

echo "=== Lazy Loaded Modules ==="
grep -rn "loadChildren\|loadComponent" --include="*.ts" | head -10

echo ""
echo "=== Route Guards ==="
grep -rn "canActivate\|canDeactivate\|resolve" --include="*.ts" | head -10

echo ""
echo "=== Missing Lazy Loading ==="
grep -rn "component:" --include="*routing*.ts" | grep -v "loadChildren" | head -10
