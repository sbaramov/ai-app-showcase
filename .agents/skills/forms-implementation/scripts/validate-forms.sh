#!/bin/bash
# Validate Angular Forms Implementation

echo "Checking form best practices..."

echo ""
echo "=== Forms without Validation ==="
grep -rn "FormControl\|FormGroup" --include="*.ts" | grep -v "Validators" | head -10

echo ""
echo "=== Missing Error Handling ==="
grep -rn "formControlName" --include="*.html" | grep -v "ngIf.*error\|hasError" | head -10

echo ""
echo "=== Reactive Forms Without FormBuilder ==="
grep -rn "new FormGroup\|new FormControl" --include="*.ts" | grep -v "FormBuilder" | head -10

echo ""
echo "Validation complete. Review findings above."
