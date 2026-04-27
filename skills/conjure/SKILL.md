---
name: conjure
description: 'Analyze a repository to discover technologies, extract patterns and conventions, and generate per-technology Claude skills. Use when the user asks to "conjure skills", "analyze this repo", "generate skills for this codebase", "index the codebase", "scan technologies", or "set up Claude for this repo".'
argument-hint: [--update] [--only tech1,tech2] [--skip-claude-md] [--skip-agents-md]
---

Parse `$ARGUMENTS` as follows:
- **--update**: Re-analyze and update existing skills instead of skipping them
- **--only tech1,tech2**: Only analyze the specified technologies (comma-separated, lowercase)
- **--skip-claude-md**: Skip the CLAUDE.md creation/update prompt
- **--skip-agents-md**: Skip the AGENTS.md creation/update prompt

If no arguments are provided, run a full analysis.

## What This Skill Does

Scan the current repository, discover every significant technology in use, then generate a set of `.claude/skills/<technology>/` directories — each containing a `SKILL.md` and `references/patterns.md` — that Claude auto-loads as background knowledge when working with relevant files.

Optionally create or update a `.claude/CLAUDE.md` with a repo overview, commands, and architecture summary. Also optionally create or update an `AGENTS.md` at the repo root — an open standard supported by Codex, Cursor, VS Code, Gemini, and other AI coding tools — using the same content.

---

## Phase 1: Discovery

Reference [technology-signals.md](references/technology-signals.md) for the complete detection matrix.

### Step 1 — Identify the repo root
Look for `.git/`, `package.json`, `go.mod`, `Cargo.toml`, or similar markers. If none found, treat the current directory as root.

### Step 2 — Check for existing skills
Glob for `.claude/skills/*/SKILL.md`. If found, note which technologies already have skills. If `--update` was NOT passed, these will be skipped later (after confirmation).

### Step 3 — Scan package manifests
Read all package manifests found at the repo root and in workspace packages:
- `package.json` (and workspace `package.json` files if monorepo)
- `go.mod`, `requirements.txt`, `pyproject.toml`, `Gemfile`, `Cargo.toml`, `pom.xml`, `build.gradle`, `composer.json`, `*.csproj`

Extract dependency names and versions.

### Step 4 — Scan config files
Glob for framework and tool config files:
- Framework: `nest-cli.json`, `next.config.*`, `nuxt.config.*`, `angular.json`, `svelte.config.*`
- ORM: `schema.prisma`, `ormconfig.*`, `drizzle.config.*`
- Build: `vite.config.*`, `webpack.config.*`, `nx.json`, `turbo.json`, `tsconfig.json`
- Testing: `jest.config.*`, `vitest.config.*`, `playwright.config.*`, `cypress.config.*`
- Infra: `Dockerfile`, `docker-compose.*`, `.github/workflows/`, `.gitlab-ci.yml`
- Style: `tailwind.config.*`, `.eslintrc.*`, `eslint.config.*`, `.prettierrc*`

### Step 5 — Detect monorepo
Check for `pnpm-workspace.yaml`, `lerna.json`, `nx.json`, `turbo.json`, or `workspaces` in root `package.json`. If monorepo, note the workspace structure and scan each workspace package too.

### Step 6 — Build the technology list
Cross-reference findings against [technology-signals.md](references/technology-signals.md). A technology is detected if:
- It has 1 **strong signal** (dedicated config file like `nest-cli.json` or `schema.prisma`), OR
- It has 2+ **weak signals** (dependency name + matching file patterns)

### Step 7 — Present findings
Show the user a table:

```
Technology     | Confidence | Signals
---------------|------------|--------
NestJS         | High       | @nestjs/core in package.json, nest-cli.json found
Prisma         | High       | schema.prisma found, @prisma/client dependency
TypeScript     | High       | tsconfig.json, .ts files throughout
Jest           | Medium     | jest dependency, *.spec.ts files found
```

If `--only` was passed, filter to just those technologies.

Ask the user to confirm the list using AskUserQuestion. Present the detected technologies as multi-select options so the user can deselect any they don't want skills for.

---

## Phase 2: Deep Analysis

For each confirmed technology, launch a **parallel Explore agent** (up to 5 at a time). Each agent receives:

1. The technology name
2. The detection signals found
3. Instructions to read 5-10 representative files and extract:

**What each agent must find:**
- **Patterns**: How is this technology used? Constructor patterns, decorator usage, module organization, component structure, hook patterns, query patterns, etc. Find 3-5 concrete patterns with file path references.
- **Conventions**: Naming (files, classes, functions, variables), directory structure, import ordering, export style. Be specific — "controllers use `AuthGuard`" not "use guards."
- **Error handling**: How does this repo handle errors with this technology? Custom exceptions? Error boundaries? Validation pipes?
- **Anti-patterns**: Any inconsistencies, code smells, or patterns that diverge from best practices for this technology. At least 1.
- **Key files**: 3-5 file paths that serve as the best examples of this technology's usage.
- **Version**: The exact version in use if detectable.
- **Related technologies**: Which other detected technologies does this one interact with?

**Agent prompt template:**
```
Analyze how {technology} is used in this repository at {repo_root}.

Detection signals found: {signals}

Read 5-10 representative files that use {technology}. For each file, note:
- What patterns it demonstrates
- How it follows (or breaks) {technology} conventions

Then synthesize your findings into:
1. PATTERNS: 3-5 concrete patterns with file:line references
2. CONVENTIONS: Naming, structure, imports specific to this repo
3. ERROR_HANDLING: How errors are handled with this technology
4. ANTI_PATTERNS: At least 1 inconsistency or code smell
5. KEY_FILES: 3-5 best example files
6. VERSION: Exact version if found
7. RELATED: Other technologies this interacts with

Be specific to THIS repo. Do not give generic {technology} documentation.
```

---

## Phase 3: Skill Generation

For each technology, reference [skill-template.md](references/skill-template.md) for the output format.

### Step 1 — Check for existing skill
If `.claude/skills/<tech>/SKILL.md` already exists and `--update` was NOT passed, skip it.

### Step 2 — Create directory
```bash
mkdir -p .claude/skills/<tech>/references
```

### Step 3 — Write SKILL.md
Generate the skill following the template. Critical requirements:
- The `name` field must be the technology in kebab-case
- The `description` field MUST include "Use when:" with specific file/context triggers
- Set `user-invocable: false` so Claude auto-loads it as background knowledge
- Every code snippet MUST reference a real file path from this repo
- Include at least 3 patterns, 1 anti-pattern, and a common workflow
- Cross-link to related skills in the "Related Skills" section

### Step 4 — Write references/patterns.md
Write an expanded reference file with:
- Detailed code examples (with file paths)
- Explanation of WHY each pattern is used
- Edge cases and gotchas specific to this repo
- Target 3000-6000 characters

### Step 5 — Write additional reference files if warranted
If the technology has complex configuration, multiple sub-patterns, or extensive conventions, create additional reference files like:
- `references/configuration.md` — for complex config setups
- `references/testing.md` — for technology-specific testing patterns
- `references/migrations.md` — for database/schema migration workflows

Only create these if there's enough repo-specific content to justify them. Do not create empty or generic files.

---

## Phase 4: CLAUDE.md

Skip this phase if `--skip-claude-md` was passed.

### Step 1 — Check for existing CLAUDE.md
Look for `.claude/CLAUDE.md` in the repo root.

### Step 2 — Ask the user
Use AskUserQuestion:
- If CLAUDE.md exists: "A .claude/CLAUDE.md already exists. Would you like to update it with findings from this analysis, or leave it as-is?"
- If no CLAUDE.md: "Would you like to create a .claude/CLAUDE.md with a repo overview, commands, and architecture summary?"

### Step 3 — Generate CLAUDE.md
If the user says yes, follow [claude-md-template.md](references/claude-md-template.md). Extract real data:
- Project name from package.json `name` field or directory name
- Commands from package.json `scripts`, Makefile targets, or CI workflow files
- Architecture from the actual directory tree
- Conventions from .editorconfig, .prettierrc, .eslintrc, commit history
- Add a "Generated Skills" section linking to each `.claude/skills/<tech>/`

If updating an existing CLAUDE.md, preserve any existing content and merge new sections. Do not overwrite user-written content.

---

## Phase 4b: AGENTS.md (Codex / Cursor / other AI tools)

Skip this phase if `--skip-agents-md` was passed.

`AGENTS.md` is an open standard equivalent of `CLAUDE.md` supported by Codex, Cursor, VS Code, Gemini, Android Studio, and other AI coding tools. It lives at the repo root (not under `.claude/`) and contains the same kind of repo overview, commands, architecture, and conventions content.

### Step 1 — Check for existing AGENTS.md
Look for `AGENTS.md` at the repo root.

### Step 2 — Ask the user
Use AskUserQuestion:
- If a CLAUDE.md was just created/updated in Phase 4: "Would you like to also generate an `AGENTS.md` at the repo root for Codex / Cursor / other AI tools? It will mirror the CLAUDE.md content."
- If AGENTS.md already exists: "An `AGENTS.md` already exists at the repo root. Would you like to update it with findings from this analysis, or leave it as-is?"
- If no AGENTS.md and no CLAUDE.md was generated: "Would you like to create an `AGENTS.md` at the repo root for Codex / Cursor / other AI tools with a repo overview, commands, and architecture summary?"

### Step 3 — Generate AGENTS.md
If the user says yes:
- Reuse the same content structure as [claude-md-template.md](references/claude-md-template.md) — the body content is identical.
- Write to `AGENTS.md` at the repo root (NOT under `.claude/`).
- If a CLAUDE.md was generated in Phase 4, you may copy its content directly to AGENTS.md to keep them in sync.

### Step 4 — Add the skill manifest
Unlike Claude Code, Codex / Cursor / other tools do NOT auto-load files in `.claude/skills/`. To make the generated skills useful to those tools, AGENTS.md MUST include a **Repo-Specific Patterns** section that acts as a manifest — listing each generated skill, what it covers, and explicitly instructing the agent to read it on demand.

Replace the standard "Generated Skills" section with this manifest:

```markdown
## Repo-Specific Patterns

This repo has detailed, repo-specific guidance for each technology in
`.claude/skills/<tech>/SKILL.md`. **Read the relevant skill file before writing
or modifying code that touches that technology** — the skills contain real
patterns and conventions extracted from this codebase.

| When working on... | Read |
|--------------------|------|
| <NestJS modules, services, controllers, decorators> | [.claude/skills/nestjs/SKILL.md](.claude/skills/nestjs/SKILL.md) |
| <Prisma schema, queries, migrations> | [.claude/skills/prisma/SKILL.md](.claude/skills/prisma/SKILL.md) |
| <any .ts / .tsx file> | [.claude/skills/typescript/SKILL.md](.claude/skills/typescript/SKILL.md) |

Each skill's `references/` directory contains additional detail (patterns,
testing, migrations, etc.) — read those when the SKILL.md points to them.
```

The "When working on..." column should describe specific triggers (file globs, decorators, function names) — pulled from each skill's frontmatter `description` field. Be concrete enough that an agent can pattern-match its current task against the row without reading every file.

If updating an existing AGENTS.md, preserve any existing content and merge new sections. Do not overwrite user-written content. Add a comment `<!-- Updated by /conjure on YYYY-MM-DD -->` at the bottom.

---

## Phase 5: Summary

Print a summary table:

```
Skill Generated     | Files Created                          | Status
--------------------|----------------------------------------|--------
nestjs              | .claude/skills/nestjs/SKILL.md + 1 ref | Created
prisma              | .claude/skills/prisma/SKILL.md + 2 ref | Created
typescript          | .claude/skills/typescript/SKILL.md     | Updated
jest                | .claude/skills/jest/SKILL.md + 1 ref   | Skipped (exists)
CLAUDE.md           | .claude/CLAUDE.md                      | Created
AGENTS.md           | AGENTS.md                              | Created
```

Then print: "Skills conjured. Claude will now auto-load these when working with relevant files in this repo."

---

## Rules

1. **Be repo-specific.** Generated skills must reflect THIS repo's actual patterns, not generic documentation. Every code example must reference a real file.
2. **Use parallel agents.** Phase 2 must use parallel Explore agents for speed. Do not analyze technologies sequentially.
3. **Respect existing work.** Never overwrite existing skills without `--update` or explicit user confirmation.
4. **Keep skills scannable.** SKILL.md files should be 80-130 lines. Move detailed content to `references/`.
5. **Cross-link skills.** If NestJS uses Prisma, the NestJS skill should reference the Prisma skill and vice versa.
6. **Detect, don't guess.** Only generate skills for technologies with clear evidence in the codebase.
7. **Monorepo aware.** If multiple services use the same technology differently, note the variations within a single skill (not separate skills per service).
8. **Include anti-patterns.** Every generated skill must have at least one "Anti-Patterns" or "WARNING" section based on actual code observations.
