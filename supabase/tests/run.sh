#!/usr/bin/env bash
#
# Verify the migrations against a throwaway Postgres cluster.
#
# This does NOT touch your Supabase project or any Postgres server you already
# run — it creates its own cluster under a temp directory and tears it down.
#
# Requires a local Postgres install (initdb, pg_ctl, psql on PATH).
#
#   ./supabase/tests/run.sh
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TESTS_DIR="$REPO_ROOT/supabase/tests"
PORT="${REHEARSLY_TEST_PGPORT:-55433}"
PGDATA="$(mktemp -d "${TMPDIR:-/tmp}/rehearsly-pg.XXXXXX")"
# Unix socket paths are capped at ~103 bytes, so keep the socket dir short.
SOCKDIR="$(mktemp -d /tmp/rhsl.XXXXXX)"

cleanup() {
  pg_ctl -D "$PGDATA" stop -m immediate >/dev/null 2>&1 || true
  rm -rf "$PGDATA" "$SOCKDIR"
}
trap cleanup EXIT

echo "==> initialising throwaway cluster at $PGDATA"
initdb -D "$PGDATA" -U postgres --auth=trust >/dev/null

echo "==> starting on 127.0.0.1:$PORT"
pg_ctl -D "$PGDATA" -o "-p $PORT -k $SOCKDIR -h 127.0.0.1" -l "$PGDATA/server.log" start >/dev/null
for _ in $(seq 1 20); do
  pg_isready -h 127.0.0.1 -p "$PORT" -q && break
  sleep 0.5
done

PSQL=(psql -h 127.0.0.1 -p "$PORT" -U postgres -v ON_ERROR_STOP=1)

"${PSQL[@]}" -d postgres -q -c "create database rehearsly_test;"

echo "==> stubbing Supabase-managed objects (auth schema, anon/authenticated roles)"
"${PSQL[@]}" -d rehearsly_test -q -f "$TESTS_DIR/00_supabase_stubs.sql"

echo "==> applying migrations"
for migration in "$REPO_ROOT"/supabase/migrations/*.sql; do
  echo "    $(basename "$migration")"
  "${PSQL[@]}" -d rehearsly_test -q -f "$migration"
done

echo
echo "==> RLS isolation"
"${PSQL[@]}" -d rehearsly_test -f "$TESTS_DIR/01_rls_isolation.sql"

echo
echo "==> schema shape"
"${PSQL[@]}" -d rehearsly_test -f "$TESTS_DIR/02_schema_shape.sql"

echo
echo "All migration checks passed."
