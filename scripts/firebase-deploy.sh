#!/usr/bin/env bash
# Builds the React frontend, syncs it into the Firebase Hosting directory, and
# deploys both hosting + backend functions via the Firebase CLI.

set -euo pipefail

usage() {
  cat <<'EOF'
Usage: scripts/firebase-deploy.sh [options]

Automates the Firebase deployment for the VoxTrail stack by:
  1. Running pre-deployment checks
  2. Building the Vite frontend (travel-app-fe)
  3. Verifying build artifacts
  4. Copying the build artifacts into travel-app-be/public
  5. Running firebase deploy (hosting + backend functions)
  6. Verifying deployment

Options:
  -p, --project <id>      Override the Firebase project ID passed to the CLI.
      --skip-frontend     Reuse the existing travel-app-fe/dist folder instead of
                         running npm run build.
      --skip-tests        Skip running tests before deployment.
      --skip-checks       Skip all pre-deployment checks (Firebase login, etc.).
      --force             Skip confirmation prompts (useful for CI/CD).
      --dry-run           Show what would be deployed without actually deploying.
  -h, --help              Show this message.

You can also set FIREBASE_DEPLOY_PROJECT or rely on the .firebaserc default.
EOF
}

PROJECT_ID="${FIREBASE_DEPLOY_PROJECT:-}"
SKIP_FRONTEND_BUILD=0
SKIP_TESTS=0
SKIP_CHECKS=0
FORCE=0
DRY_RUN=0

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
    --skip-tests)
      SKIP_TESTS=1
      shift
      ;;
    --skip-checks)
      SKIP_CHECKS=1
      shift
      ;;
    --force)
      FORCE=1
      shift
      ;;
    --dry-run)
      DRY_RUN=1
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

# Logging helper
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

log_error() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $*" >&2
}

log_warn() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $*" >&2
}

# Check for required commands
if ! command -v npm >/dev/null 2>&1; then
  log_error "npm is required but was not found in PATH."
  exit 1
fi

if ! command -v firebase >/dev/null 2>&1; then
  log_error "firebase CLI is required. Install via 'npm install -g firebase-tools'."
  exit 1
fi

# Pre-deployment checks
if [[ ${SKIP_CHECKS} -eq 0 ]]; then
  log "[0/6] Running pre-deployment checks..."
  
  # Check Firebase login
  if ! firebase projects:list >/dev/null 2>&1; then
    log_error "Not logged into Firebase. Run 'firebase login' first."
    exit 1
  fi
  
  # Check for uncommitted changes (warn only, unless in CI)
  if [[ -z "${CI:-}" ]] && command -v git >/dev/null 2>&1; then
    if [[ -d "${REPO_ROOT}/.git" ]] && [[ -n "$(git -C "${REPO_ROOT}" status --porcelain 2>/dev/null || true)" ]]; then
      log_warn "Uncommitted changes detected in repository."
      if [[ ${FORCE} -eq 0 ]]; then
        read -p "Continue with deployment? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
          log "Deployment cancelled."
          exit 1
        fi
      fi
    fi
  fi
  
  # Check Node.js version (warn if < 18)
  NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
  if [[ ${NODE_VERSION} -lt 18 ]]; then
    log_warn "Node.js version is ${NODE_VERSION}. Recommended: 18 or higher."
  fi
  
  log "✅ Pre-deployment checks passed"
else
  log "[0/6] Skipping pre-deployment checks (per flag)"
fi

# Run tests (optional)
if [[ ${SKIP_TESTS} -eq 0 ]] && [[ -z "${CI:-}" ]]; then
  log "[1/6] Running frontend tests..."
  if (cd "${FRONTEND_DIR}" && npm test -- --run >/dev/null 2>&1); then
    log "✅ Frontend tests passed"
  else
    log_warn "Frontend tests failed or not configured."
    if [[ ${FORCE} -eq 0 ]]; then
      read -p "Continue with deployment anyway? (y/N) " -n 1 -r
      echo
      if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Deployment cancelled."
        exit 1
      fi
    fi
  fi
else
  log "[1/6] Skipping tests (CI mode or --skip-tests flag)"
fi

# Build frontend
if [[ ${SKIP_FRONTEND_BUILD} -eq 0 ]]; then
  log "[2/6] Building frontend via npm run build..."
  if ! (cd "${FRONTEND_DIR}" && npm run build); then
    log_error "Frontend build failed."
    exit 1
  fi
  log "✅ Frontend build completed"
else
  log "[2/6] Skipping frontend build (per flag)"
fi

# Verify build artifacts
log "[3/6] Verifying build artifacts..."
if [[ ! -d "${FRONTEND_BUILD_DIR}" ]]; then
  log_error "Frontend build output not found at ${FRONTEND_BUILD_DIR}."
  log_error "Make sure the build step succeeded or rerun without --skip-frontend."
  exit 1
fi

if [[ ! -f "${FRONTEND_BUILD_DIR}/index.html" ]]; then
  log_error "Build appears to have failed (index.html missing)."
  exit 1
fi

# Check build size (sanity check - warn if suspiciously small)
BUILD_SIZE=$(du -sm "${FRONTEND_BUILD_DIR}" 2>/dev/null | cut -f1 || echo "0")
if [[ ${BUILD_SIZE} -lt 1 ]]; then
  log_warn "Build size is suspiciously small (${BUILD_SIZE}MB)."
  if [[ ${FORCE} -eq 0 ]]; then
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      log "Deployment cancelled."
      exit 1
    fi
  fi
fi

log "✅ Build artifacts verified (${BUILD_SIZE}MB)"

# Sync to hosting directory
log "[4/6] Syncing frontend build to ${HOSTING_DIR}..."
rm -rf "${HOSTING_DIR}"
mkdir -p "${HOSTING_DIR}"
cp -R "${FRONTEND_BUILD_DIR}/." "${HOSTING_DIR}/"
log "✅ Build artifacts synced"

# Deploy to Firebase
if [[ ${DRY_RUN} -eq 1 ]]; then
  log "[5/6] DRY RUN: Would deploy Firebase Hosting + Functions..."
  CMD=(firebase deploy --only hosting,functions:backend --dry-run)
  if [[ -n "${PROJECT_ID}" ]]; then
    CMD+=(--project "${PROJECT_ID}")
  fi
  (cd "${BACKEND_DIR}" && "${CMD[@]}")
  log "✅ Dry run completed (no changes made)"
else
  log "[5/6] Deploying Firebase Hosting + Functions..."
  
  # Confirmation prompt for production (unless forced or in CI)
  if [[ ${FORCE} -eq 0 ]] && [[ -z "${CI:-}" ]]; then
    # Extract project ID from firebase use output (portable, works on macOS and Linux)
    if [[ -z "${PROJECT_ID}" ]]; then
      FIREBASE_USE_OUTPUT=$(firebase use 2>/dev/null || echo "")
      if [[ -n "${FIREBASE_USE_OUTPUT}" ]]; then
        DEPLOY_PROJECT=$(echo "${FIREBASE_USE_OUTPUT}" | sed -n 's/.*(\([^)]*\)).*/\1/p' | head -1)
      fi
      DEPLOY_PROJECT="${DEPLOY_PROJECT:-default}"
    else
      DEPLOY_PROJECT="${PROJECT_ID}"
    fi
    echo
    echo "Ready to deploy to Firebase project: ${DEPLOY_PROJECT}"
    read -p "Continue with deployment? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      log "Deployment cancelled."
      exit 1
    fi
  fi
  
  CMD=(firebase deploy --only hosting,functions:backend)
  if [[ -n "${PROJECT_ID}" ]]; then
    CMD+=(--project "${PROJECT_ID}")
  fi
  
  if (cd "${BACKEND_DIR}" && "${CMD[@]}"); then
    log "✅ Firebase deployment completed"
  else
    log_error "Firebase deployment failed."
    exit 1
  fi
fi

# Post-deployment verification
if [[ ${DRY_RUN} -eq 0 ]]; then
  log "[6/6] Verifying deployment..."
  # Extract project ID from firebase use output (portable, works on macOS and Linux)
  if [[ -z "${PROJECT_ID}" ]]; then
    FIREBASE_USE_OUTPUT=$(firebase use 2>/dev/null || echo "")
    if [[ -n "${FIREBASE_USE_OUTPUT}" ]]; then
      FINAL_PROJECT=$(echo "${FIREBASE_USE_OUTPUT}" | sed -n 's/.*(\([^)]*\)).*/\1/p' | head -1)
    fi
  else
    FINAL_PROJECT="${PROJECT_ID}"
  fi
  
  if [[ -n "${FINAL_PROJECT}" ]] && [[ "${FINAL_PROJECT}" != "default" ]]; then
    DEPLOYED_URL="https://${FINAL_PROJECT}.web.app"
    if command -v curl >/dev/null 2>&1; then
      if curl -sf --max-time 10 "${DEPLOYED_URL}" >/dev/null 2>&1; then
        log "✅ Deployment verified: ${DEPLOYED_URL}"
      else
        log_warn "Could not immediately verify deployment (site may still be deploying)"
        log "Site URL: ${DEPLOYED_URL}"
      fi
    else
      log "Deployment complete. Site URL: ${DEPLOYED_URL}"
    fi
  else
    log "✅ Deployment completed"
  fi
else
  log "[6/6] Skipping verification (dry run)"
fi

log "Firebase deployment finished successfully."
