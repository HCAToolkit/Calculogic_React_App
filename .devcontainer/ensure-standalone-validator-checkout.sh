#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="$(git rev-parse --show-toplevel)"
WORKSPACES_ROOT="$(dirname "$APP_ROOT")"
VALIDATOR_ROOT="${CALCULOGIC_VALIDATOR_CHECKOUT:-$WORKSPACES_ROOT/calculogic-validator}"
VALIDATOR_REMOTE="https://github.com/HCAToolkit/calculogic-validator.git"

if [ -d "$VALIDATOR_ROOT" ]; then
  GIT_TOP_LEVEL="$(git -C "$VALIDATOR_ROOT" rev-parse --show-toplevel 2>/dev/null || true)"

  if [ -n "$GIT_TOP_LEVEL" ]; then
    VALIDATOR_ROOT_REAL="$(cd "$VALIDATOR_ROOT" && pwd -P)"
    GIT_TOP_LEVEL_REAL="$(cd "$GIT_TOP_LEVEL" && pwd -P)"

    if [ "$VALIDATOR_ROOT_REAL" = "$GIT_TOP_LEVEL_REAL" ]; then
      PACKAGE_NAME="$(node -e '
        const fs = require("node:fs");
        try {
          const pkg = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
          process.stdout.write(typeof pkg.name === "string" ? pkg.name : "");
        } catch {}
      ' "$VALIDATOR_ROOT/package.json")"

      if [ "$PACKAGE_NAME" = "@calculogic/validator" ]; then
        echo "Standalone validator checkout already available at: $VALIDATOR_ROOT"
        exit 0
      fi
    fi
  fi
fi

if [ -e "$VALIDATOR_ROOT" ]; then
  echo "Cannot prepare standalone validator checkout: $VALIDATOR_ROOT exists but is not the @calculogic/validator Git worktree root." >&2
  exit 1
fi

echo "Cloning standalone validator into: $VALIDATOR_ROOT"
git clone "$VALIDATOR_REMOTE" "$VALIDATOR_ROOT"
echo "Standalone validator checkout ready."
