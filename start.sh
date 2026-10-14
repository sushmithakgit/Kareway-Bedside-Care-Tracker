#!/usr/bin/env bash
# ── Patient AAC App launcher (macOS / Linux) ────────────────────────────────
#  Backend + frontend run in this single terminal; press Ctrl+C to stop both.

cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
    echo
    echo "[ERROR] Node.js is not installed."
    echo
    echo "Please install Node.js v20 or newer from:"
    echo "  https://nodejs.org/"
    echo
    echo "macOS users with Homebrew:  brew install node"
    echo
    exit 1
fi

exec node "$(dirname "$0")/launch.js"
