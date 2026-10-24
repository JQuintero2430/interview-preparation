#!/bin/sh
# labs/angular/deploy/docker-entrypoint.d/40-write-config.sh — documented only, not built: Docker is not run in the labs
# Writes config.json from the container's environment when it starts, so one image serves every environment.
# docker-entrypoint.sh runs a /docker-entrypoint.d/*.sh file only if it is executable, and in sort -V order: this file
# runs after 20-envsubst-on-templates.sh. The Dockerfile copies it with --chmod=755 for that reason.
# Everything written here is downloaded by every visitor: never put a secret in the template or its variables.
set -eu

# The Dockerfile copies the template here; the unprivileged image runs as UID 101 and does not change the owner of
# /usr/share/nginx/html, so the file goes under /tmp (the image itself keeps its pid file and temp paths there) and
# `location = /config.json` in the Nginx template serves it with alias.
TEMPLATE=/opt/app/config.json.template
OUTPUT_DIR=/tmp/app-config

# Collect every missing name first, so one failed start lists all of them.
missing=""
check() {
  [ -n "$2" ] || missing="$missing $1"
}
check API_URL "${API_URL:-}"
check FEATURE_FLAGS_URL "${FEATURE_FLAGS_URL:-}"
check RELEASE "${RELEASE:-}"
check TRACE_SAMPLE_RATE "${TRACE_SAMPLE_RATE:-}"

# A non-zero exit stops the container, so the orchestrator sees the failed start; a bad value in the browser is invisible.
if [ -n "$missing" ]; then
  echo "40-write-config.sh: required variables not set or empty:$missing" >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR"
# An explicit list, not the whole environment: only these four names are replaced. Values are inserted as text, so a
# quote or a backslash in one would break the JSON; traceSampleRate is a number in the template, hence required.
envsubst '${API_URL} ${FEATURE_FLAGS_URL} ${RELEASE} ${TRACE_SAMPLE_RATE}' < "$TEMPLATE" > "$OUTPUT_DIR/config.json"
