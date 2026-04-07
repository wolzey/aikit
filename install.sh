#!/bin/bash
set -e

AIKIT_HOME="${AIKIT_HOME:-$HOME/.aikit}"
TARGET_DIR="$HOME/.claude/skills"

# Clone or update the repo
if [ -d "$AIKIT_HOME" ]; then
  echo "Updating aikit..."
  git -C "$AIKIT_HOME" pull --quiet
else
  echo "Installing aikit..."
  git clone --quiet https://github.com/wolzey/aikit.git "$AIKIT_HOME"
fi

mkdir -p "$TARGET_DIR"

SKILLS_DIR="$AIKIT_HOME/skills"

for skill_dir in "$SKILLS_DIR"/*/; do
  [ -d "$skill_dir" ] || continue
  skill_name="$(basename "$skill_dir")"
  if [ -L "$TARGET_DIR/$skill_name" ] || [ -d "$TARGET_DIR/$skill_name" ]; then
    echo "  Updating: /$skill_name"
    rm -rf "$TARGET_DIR/$skill_name"
  else
    echo "  Installing: /$skill_name"
  fi
  ln -sfn "$skill_dir" "$TARGET_DIR/$skill_name"
done

echo ""
echo "Done! Available skills:"
for skill_dir in "$SKILLS_DIR"/*/; do
  [ -d "$skill_dir" ] || continue
  echo "  /$(basename "$skill_dir")"
done
echo ""
echo "Source: $AIKIT_HOME"
echo "Run 'aikit update' or re-run this script to update."
