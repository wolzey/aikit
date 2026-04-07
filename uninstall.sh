#!/bin/bash
set -e

AIKIT_HOME="${AIKIT_HOME:-$HOME/.aikit}"
TARGET_DIR="$HOME/.claude/skills"

if [ ! -d "$AIKIT_HOME" ]; then
  echo "aikit is not installed."
  exit 0
fi

SKILLS_DIR="$AIKIT_HOME/skills"

for skill_dir in "$SKILLS_DIR"/*/; do
  [ -d "$skill_dir" ] || continue
  skill_name="$(basename "$skill_dir")"
  link="$TARGET_DIR/$skill_name"
  if [ -L "$link" ]; then
    echo "  Removing: /$skill_name"
    rm "$link"
  fi
done

rm -rf "$AIKIT_HOME"

echo ""
echo "aikit uninstalled."
