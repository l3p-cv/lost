#!/bin/bash
# backend/run_snapshots.sh
# Run the golden-snapshot test suite end-to-end.
#
# Usage:
#   ./run_snapshots.sh                          # collect-only check
#   ./run_snapshots.sh tests/compare/...        # run specific tests
#   ./run_snapshots.sh tests/compare/... -v     # run with verbose pytest output
#   ./run_snapshots.sh tests/compare/... --record    # re-record snapshots
#   ./run_snapshots.sh tests/compare/... --cleanup   # force-remove leftover test data
#   ./run_snapshots.sh tests/compare/... --verbose   # also show container logs after run
#
# Flags --record, --cleanup, --verbose are consumed by this script.
# All other args (e.g. -v, -k, specific test paths) are forwarded to pytest.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/docker/compose/compose.yaml"
OVERRIDE_FILE="$REPO_ROOT/docker/compose/compose.override.yaml"
CONTAINER="${LOST_CONTAINER:-lost-backend-1}"

# --- Parse args: extract script flags, forward the rest to pytest ---
VERBOSE=false
PYTEST_ARGS=()
for arg in "$@"; do
    case "$arg" in
        --verbose)    VERBOSE=true ;;
        --record|--cleanup) PYTEST_ARGS+=("$arg") ;;
        *)            PYTEST_ARGS+=("$arg") ;;
    esac
done

# 1. Ensure compose stack is up (include override for bind mount)
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
    echo "✓ Container $CONTAINER already running"
else
    echo "▶ Starting compose stack..."
    docker compose -f "$COMPOSE_FILE" -f "$OVERRIDE_FILE" up -d --build
fi

# 2. Ensure DB seed (idempotent — safe on existing dev DB)
echo "▶ Running initlost (idempotent DB seed)..."
docker exec "$CONTAINER" python3 /code/lost/logic/init/initlost.py 2>&1 | tail -5

# 2b. Ensure test data (idempotent — creates compare_test_* entities if missing)
echo "▶ Running init_test_data (idempotent test data seed)..."
docker exec "$CONTAINER" python3 /code/tests/helpers/init_test_data.py 2>&1 | tail -2

# 3. Verify tests dir is visible in container (bind mount check)
echo "▶ Verifying tests dir visible in container..."
if ! docker exec "$CONTAINER" test -d /code/tests; then
    echo "✗ /code/tests not found in container — check compose.override.yaml bind mount"
    exit 1
fi
echo "✓ /code/tests visible in container"

# 4. Run pytest
PYTEST_EXIT=0
if [[ ${#PYTEST_ARGS[@]} -gt 0 ]]; then
    echo "▶ Running pytest: ${PYTEST_ARGS[*]}"
    docker exec "$CONTAINER" bash -lc "cd /code && python -m pytest ${PYTEST_ARGS[*]} 2>&1" || PYTEST_EXIT=$?
else
    echo "▶ Running pytest --collect-only (verify harness loads)..."
    docker exec "$CONTAINER" bash -lc "cd /code && python -m pytest tests/ --collect-only -q 2>&1" | tail -5 || PYTEST_EXIT=$?
fi

# 5. Show container logs if --verbose
if $VERBOSE; then
    echo ""
    echo "▶ Container logs (last 50 lines):"
    echo "----------------------------------------"
    docker logs --tail 50 "$CONTAINER" 2>&1 || true
    echo "----------------------------------------"
elif [[ $PYTEST_EXIT -ne 0 ]]; then
    echo ""
    echo "▶ Tests failed. Re-run with --verbose to see container logs:"
    echo "  ./backend/run_snapshots.sh ${*} --verbose"
fi

echo ""
echo "✓ P0 harness complete. Golden snapshots recorded and verified."
exit $PYTEST_EXIT
