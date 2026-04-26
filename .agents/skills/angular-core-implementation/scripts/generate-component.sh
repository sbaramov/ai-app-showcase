#!/bin/bash
# Generate Angular Component with Best Practices

if [ -z "$1" ]; then
    echo "Usage: ./generate-component.sh <component-name>"
    exit 1
fi

COMPONENT_NAME=$1

# Generate standalone component with OnPush
ng generate component $COMPONENT_NAME \
    --standalone \
    --change-detection=OnPush \
    --skip-tests=false

echo "Component $COMPONENT_NAME generated successfully!"
echo "Remember to:"
echo "  1. Add proper @Input() and @Output() decorators"
echo "  2. Implement OnInit and OnDestroy"
echo "  3. Use takeUntil for subscription cleanup"
