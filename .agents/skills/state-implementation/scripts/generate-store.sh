#!/bin/bash
# Generate NgRx Store Files

if [ -z "$1" ]; then
    echo "Usage: ./generate-store.sh <feature-name>"
    exit 1
fi

FEATURE=$1

ng generate @ngrx/schematics:feature $FEATURE \
    --module=app.module.ts \
    --group \
    --api

echo "NgRx feature '$FEATURE' generated!"
echo "Remember to add to StoreModule.forRoot()"
