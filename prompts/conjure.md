---
description: Analyze this repo and generate repo-specific AI guidance for pi, Claude Code, and AGENTS.md-compatible agents
argument-hint: "[--update] [--only tech1,tech2] [--skip-claude-md] [--skip-agents-md]"
---
Run aikit's conjure workflow with these arguments: `$ARGUMENTS`.

Use the installed `conjure` skill as the source of truth. If the full skill instructions are not already loaded, read the `conjure` skill's `SKILL.md` first, then follow its phases.

Pi-specific output preferences:

1. Prefer portable generated skills in `.agents/skills/<technology>/SKILL.md`.
2. Also generate `.claude/skills/<technology>/SKILL.md` when Claude Code compatibility is desired or existing Claude skills are present.
3. Generate or update root `AGENTS.md` with a manifest that points agents to the relevant generated skills.
4. If this repo uses pi, preserve or add `.pi/` configuration only when necessary; pi already discovers project `.agents/skills/` after trust.
5. Keep the generated skill content repo-specific, cited to real files, and consistent with the underlying analysis.
