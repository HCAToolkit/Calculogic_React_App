#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="$(git rev-parse --show-toplevel)"
WORKSPACES_ROOT="$(dirname "$APP_ROOT")"
VALIDATOR_ROOT="${CALCULOGIC_VALIDATOR_CHECKOUT:-$WORKSPACES_ROOT/calculogic-validator}"
VALIDATOR_REMOTE="https://github.com/HCAToolkit/calculogic-validator.git"

if [ -d "$VALIDATOR_ROOT/.git" ]; then
  echo "Standalone validator checkout already available at: $VALIDATOR_ROOT"
  exit 0
fi

if [ -e "$VALIDATOR_ROOT" ]; then
  echo "Cannot prepare standalone validator checkout: $VALIDATOR_ROOT exists but is not a Git checkout." >&2
  exit 1
fi

echo "Cloning standalone validator into: $VALIDATOR_ROOT"
git clone "$VALIDATOR_REMOTE" "$VALIDATOR_ROOT"
echo "Standalone validator checkout ready."
