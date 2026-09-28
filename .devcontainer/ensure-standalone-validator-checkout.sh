#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="$(git rev-parse --show-toplevel)"
WORKSPACES_ROOT="$(dirname "$APP_ROOT")"
VALIDATOR_ROOT="${CALCULOGIC_VALIDATOR_CHECKOUT:-$WORKSPACES_ROOT/calculogic-validator}"
VALIDATOR_REMOTE="https://github.com/HCAToolkit/calculogic-validator.git"

# The checkout must never be nested in the React app checkout. Resolve the location to a canonical
# absolute path (relative paths resolve from the current directory; symbolic links in its existing
# part are followed) and reject the app root or anything inside it before creating anything.
VALIDATOR_ROOT_RESOLVED="$(node -e '
  const fs = require("node:fs");
  const path = require("node:path");
  let existing = path.resolve(process.argv[1]);
  const missing = [];
  while (!fs.existsSync(existing) && path.dirname(existing) !== existing) {
    missing.unshift(path.basename(existing));
    existing = path.dirname(existing);
  }
  process.stdout.write(path.join(fs.realpathSync.native(existing), ...missing));
' "$VALIDATOR_ROOT")"
APP_ROOT_REAL="$(cd "$APP_ROOT" && pwd -P)"

case "$VALIDATOR_ROOT_RESOLVED/" in
  "$APP_ROOT_REAL"/*)
    echo "Cannot prepare standalone validator checkout: $VALIDATOR_ROOT resolves to $VALIDATOR_ROOT_RESOLVED, which is inside the React app checkout ($APP_ROOT_REAL). Set CALCULOGIC_VALIDATOR_CHECKOUT to a path outside it." >&2
    exit 1
    ;;
esac

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
