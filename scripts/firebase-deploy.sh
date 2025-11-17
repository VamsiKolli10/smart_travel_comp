#!/usr/bin/env bash
# Builds the React frontend, syncs it into the Firebase Hosting directory, and
# deploys both hosting + backend functions via the Firebase CLI.

set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/firebase-deploy.sh [options]

Automates the Firebase deployment for the Smart Travel Companion stack by:
  1. Building the Vite frontend (travel-app-fe)
  2. Copying the build artifacts into travel-app-be/public
  3. Running firebase deploy (hosting + backend functions)

Options:
  -p, --project <id>      Override the Firebase project ID passed to the CLI.
      --skip-frontend     Reuse the existing travel-app-fe/dist folder instead of
                         running npm run build.
  -h, --help              Show this message.

You can also set FIREBASE_DEPLOY_PROJECT or rely on the .firebaserc default.
EOF
}

PROJECT_ID="${FIREBASE_DEPLOY_PROJECT:-}"
SKIP_FRONTEND_BUILD=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    -p|--project)
      if [[ $# -lt 2 ]]; then
        echo "Missing project ID after $1" >&2
        exit 1
      fi
      PROJECT_ID="$2"
      shift 2
      ;;
    --skip-frontend)
      SKIP_FRONTEND_BUILD=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
FRONTEND_DIR="${REPO_ROOT}/travel-app-fe"
BACKEND_DIR="${REPO_ROOT}/travel-app-be"
HOSTING_DIR="${BACKEND_DIR}/public"
FRONTEND_BUILD_DIR="${FRONTEND_DIR}/dist"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required but was not found in PATH." >&2
  exit 1
fi

if ! command -v firebase >/dev/null 2>&1; then
  echo "firebase CLI is required. Install via 'npm install -g firebase-tools'." >&2
  exit 1
fi

if [[ ${SKIP_FRONTEND_BUILD} -eq 0 ]]; then
  echo "[1/3] Building frontend via npm run build..."
  npm --prefix "${FRONTEND_DIR}" run build
else
  echo "[1/3] Skipping frontend build (per flag)."
fi

if [[ ! -d "${FRONTEND_BUILD_DIR}" ]]; then
  echo "Frontend build output not found at ${FRONTEND_BUILD_DIR}." >&2
  echo "Make sure the build step succeeded or rerun without --skip-frontend." >&2
  exit 1
fi

echo "[2/3] Syncing frontend build to ${HOSTING_DIR}..."
rm -rf "${HOSTING_DIR}"
mkdir -p "${HOSTING_DIR}"
cp -R "${FRONTEND_BUILD_DIR}/." "${HOSTING_DIR}/"

echo "[3/3] Deploying Firebase Hosting + Functions..."
CMD=(firebase deploy --only hosting,functions:backend)
if [[ -n "${PROJECT_ID}" ]]; then
  CMD+=(--project "${PROJECT_ID}")
fi

(cd "${BACKEND_DIR}" && "${CMD[@]}")

echo "Firebase deployment finished."
