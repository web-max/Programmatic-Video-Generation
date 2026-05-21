#!/usr/bin/env bash
set -euo pipefail

CLAUDE_BIN="$(command -v claude 2>/dev/null || true)"

if [[ -z "$CLAUDE_BIN" ]]; then
  echo "Error: 'claude' not found on PATH. Install Claude Code: https://claude.ai/code" >&2
  exit 1
fi

echo "=== Claude Usage Check — $(date '+%Y-%m-%d %H:%M:%S %Z') ==="
echo ""

# Try non-interactive pipe first; fall back to --print flag
if output=$(echo "/usage" | "$CLAUDE_BIN" --no-color 2>&1) && [[ -n "$output" ]]; then
  echo "$output" | sed 's/\x1b\[[0-9;]*m//g'
elif output=$("$CLAUDE_BIN" --print "/usage" --no-color 2>&1); then
  echo "$output" | sed 's/\x1b\[[0-9;]*m//g'
else
  echo "Could not retrieve usage. Try running 'claude' and typing /usage manually."
  exit 1
fi
