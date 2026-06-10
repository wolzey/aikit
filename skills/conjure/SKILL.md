---
name: conjure
description: 'Analyze a repository to discover technologies, extract patterns and conventions, and generate per-technology Agent Skills for pi, Claude Code, and AGENTS.md-compatible tools. Use when the user asks to "conjure skills", "analyze this repo", "generate skills for this codebase", "index the codebase", "scan technologies", or "set up AI guidance for this repo".'
argument-hint: [--update] [--only tech1,tech2] [--skip-claude-md] [--skip-agents-md]
---

Parse `$ARGUMENTS` as follows:
- **--update**: Re-analyze and update existing skills instead of skipping them
- **--only tech1,tech2**: Only analyze the specified technologies (comma-separated, lowercase)
- **--skip-claude-md**: Skip the CLAUDE.md creation/update prompt
- **--skip-agents-md**: Skip the AGENTS.md creation/update prompt

If no arguments are provided, run a full analysis.

## What This Skill Does

Scan the current repository, discover every significant technology in use, then generate a set of portable `.agents/skills/<technology>/` directories — each containing a `SKILL.md` and `references/patterns.md` — that Agent Skills-compatible harnesses can load as repo-specific background knowledge. When Claude Code compatibility is desired, also mirror those skills to `.claude/skills/<technology>/`.

Optionally create or update a `.claude/CLAUDE.md` with a repo overview, commands, and architecture summary. Also optionally create or update an `AGENTS.md` at the repo root — an open standard supported by Codex, Cursor, VS Code, Gemini, pi, and other AI coding tools — using the same content.

The flow is: **discover → analyze (with security + claim verification) → generate skills → derive CLAUDE.md/AGENTS.md from those skills (not the other way around) → format → summarize**. Two passes during analysis (security flagging from [security-flags.md](references/security-flags.md) and claim verification via context7/docs) and one consistency check during synthesis are what keep generated content accurate and safe.

---

## Phase 1: Discovery

Reference [technology-signals.md](references/technology-signals.md) for the complete detection matrix.

### Step 1 — Identify the repo root
Look for `.git/`, `package.json`, `go.mod`, `Cargo.toml`, or similar markers. If none found, treat the current directory as root.

### Step 2 — Check for existing skills
Glob for `.agents/skills/*/SKILL.md` and `.claude/skills/*/SKILL.md`. If found, note which technologies already have skills. If `--update` was NOT passed, these will be skipped later (after confirmation).

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
- **Anti-patterns**: At least 1. Sources to scan:
  - **Repo inconsistencies** — legacy file uses pattern A, new code uses B
  - **Dangerous-but-functional patterns** — work today but fail under attack/scale (see Security Pass below)
  - **Library-version footguns** — deprecated APIs still in use
  - **Cross-cutting misuse** — forms bypassing the project's form wrapper, raw `fetch` instead of the project's data layer, etc.
- **Key files**: 3-5 file paths that serve as the best examples of this technology's usage.
- **Version**: The exact version in use if detectable.
- **Related technologies**: Which other detected technologies does this one interact with?
- **Security pass**: For every code snippet you record, scan for security-sensitive APIs from [security-flags.md](references/security-flags.md). If a snippet uses one, the snippet MUST carry a `// SECURITY:` comment explaining the risk and what new code should do instead. Treat existing usage as "WARNING: existing pattern" rather than canonical.
- **Claim verification**: Any statement of the form *"the default is X"* / *"implicitly does X"* / *"by default this..."* MUST be backed by either (a) a code line in this repo that sets the value (cite `file:line`), or (b) a context7 / web fetch of the library's official docs for the exact version in use. If neither is available, drop the claim. Do NOT rely on training-data knowledge of framework defaults — they drift between major versions.

**Agent prompt template:**
```
Analyze how {technology} is used in this repository at {repo_root}.

Detection signals found: {signals}

Read 5-10 representative files that use {technology}. For each file, note:
- What patterns it demonstrates
- How it follows (or breaks) {technology} conventions
- Whether any snippet uses a security-sensitive API (see SECURITY_PASS below)

Then synthesize your findings into:
1. PATTERNS: 3-5 concrete patterns with file:line references.
   For each snippet: if it uses a sensitive API, annotate with `// SECURITY:`
   instead of presenting it as canonical.
2. CONVENTIONS: Naming, structure, imports specific to this repo.
3. ERROR_HANDLING: How errors are handled with this technology.
4. ANTI_PATTERNS: At least 1. Look for: repo inconsistencies, dangerous-but-
   functional patterns, deprecated APIs, cross-cutting misuse.
5. KEY_FILES: 3-5 best example files.
6. VERSION: Exact version if found (read from lockfile / package manifest).
7. RELATED: Other technologies this interacts with.
8. SECURITY_PASS: Scan every collected snippet for these sensitive APIs:
     - window.postMessage(..., "*") — wildcard targetOrigin
     - innerHTML, dangerouslySetInnerHTML, outerHTML
     - eval, new Function, setTimeout(string)
     - child_process.exec/execSync with interpolated input
     - SQL string concatenation (raw queries, .raw())
     - jwt.decode without verify
     - CORS Access-Control-Allow-Origin: *
     - cookie writes without httpOnly/Secure/SameSite
     - regex constructed from user input (new RegExp(userInput))
     - fs operations on user-controlled paths
   Where found, attach `// SECURITY:` to the snippet (not as a separate
   anti-pattern) so the warning travels with the code.
9. CLAIM_VERIFICATION: Any "the default is X", "implicitly does X", "by
   default this..." claim MUST be backed by either:
     (a) a code line in THIS repo that sets it (cite file:line), OR
     (b) a context7 / web fetch of the library's docs for the exact version.
   If neither is available, drop the claim. Library defaults drift between
   major versions; do not rely on training-data knowledge.

Be specific to THIS repo. Do not give generic {technology} documentation.
```

---

## Phase 3: Skill Generation

For each technology, reference [skill-template.md](references/skill-template.md) for the output format.

### Step 1 — Check for existing skill
If `.agents/skills/<tech>/SKILL.md` or `.claude/skills/<tech>/SKILL.md` already exists and `--update` was NOT passed, skip it.

### Step 2 — Create directory
```bash
mkdir -p .agents/skills/<tech>/references
```

If Claude Code compatibility is desired, also prepare the matching `.claude/skills/<tech>/references` directory and keep its contents in sync with the portable `.agents/skills` version.

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
- Add a "Generated Skills" section linking to each `.agents/skills/<tech>/` and, when present, matching `.claude/skills/<tech>/`

**Derive gotchas from skills, do not author them independently.** The "Critical Gotchas" / "Conventions" / "Anti-patterns" bullets in CLAUDE.md must each be lifted from the corresponding generated tech skill (where one exists). The tech skills were extracted from real code via Phase 2 agents; CLAUDE.md is the synthesis layer over them, not a parallel authoring layer. For every bullet copied or written:
1. Verify the claim against the actual repo (read the file it references). Drop anything you cannot verify.
2. Run a CONSISTENCY CHECK: if the bullet mentions a technology that has a generated skill, the wording must not contradict that skill's `references/patterns.md`. Flag contradictions to the user; do not silently merge.

If updating an existing CLAUDE.md, preserve any existing content and merge new sections. Do not overwrite user-written content. If the existing CLAUDE.md contradicts a freshly generated tech skill, surface the contradiction in the summary so the user can decide which is correct.

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
- If a CLAUDE.md was generated in Phase 4, **re-derive AGENTS.md from the same skill sources** — do NOT bulk-copy CLAUDE.md content. Bulk-copy inherits any bug; re-derivation breaks the chain. The same consistency check from Phase 4 Step 3 applies: every gotcha bullet must agree with its underlying tech skill.
- If you must copy from CLAUDE.md for speed (it is freshly generated this run), re-validate every gotcha against its tech skill before writing. Flag contradictions to the user.

### Step 4 — Add the skill manifest
Unlike Claude Code, Codex / Cursor / other tools do NOT auto-load files in `.claude/skills/`. To make the generated skills useful to those tools, AGENTS.md MUST include a **Repo-Specific Patterns** section that acts as a manifest — listing each generated skill, what it covers, and explicitly instructing the agent to read it on demand.

Replace the standard "Generated Skills" section with this manifest:

```markdown
## Repo-Specific Patterns

This repo has detailed, repo-specific guidance for each technology in
`.agents/skills/<tech>/SKILL.md` (or `.claude/skills/<tech>/SKILL.md` when only Claude-compatible skills exist). **Read the relevant skill file before writing
or modifying code that touches that technology** — the skills contain real
patterns and conventions extracted from this codebase.

| When working on... | Read |
|--------------------|------|
| <NestJS modules, services, controllers, decorators> | [.agents/skills/nestjs/SKILL.md](.agents/skills/nestjs/SKILL.md) |
| <Prisma schema, queries, migrations> | [.agents/skills/prisma/SKILL.md](.agents/skills/prisma/SKILL.md) |
| <any .ts / .tsx file> | [.agents/skills/typescript/SKILL.md](.agents/skills/typescript/SKILL.md) |

Each skill's `references/` directory contains additional detail (patterns,
testing, migrations, etc.) — read those when the SKILL.md points to them.
```

The "When working on..." column should describe specific triggers (file globs, decorators, function names) — pulled from each skill's frontmatter `description` field. Be concrete enough that an agent can pattern-match its current task against the row without reading every file.

If updating an existing AGENTS.md, preserve any existing content and merge new sections. Do not overwrite user-written content. Add a comment `<!-- Updated by /conjure on YYYY-MM-DD -->` at the bottom.

### Step 5 — Validate manifest links case-sensitively

Every manifest link MUST be verified against `git ls-files` — NOT against the local filesystem. macOS APFS and Windows NTFS are case-insensitive by default; GitHub and Linux CI are case-sensitive. A link that resolves locally can 404 on GitHub.

Run this check before writing the file:

```bash
tracked=$(git ls-files .agents/skills .claude/skills)
grep -oE '\]\(\.(agents|claude)/skills/[A-Za-z0-9_./-]+\)' AGENTS.md \
  | sed -E 's/^\]\(//; s/\)$//' \
  | sort -u \
  | while read p; do
      if echo "$tracked" | grep -Fxq "$p"; then echo "OK   $p"; else echo "MISS $p"; fi
    done
```

If any line returns `MISS`, fix the link before proceeding. Two patterns that bite repeatedly:

- **Case mismatch** — some skills use lowercase `skill.md`, others use `SKILL.md`. Always link to the exact tracked filename, not the convention you assume.
- **File-vs-directory** — some skills are a single markdown file at `.claude/skills/<name>` with no `SKILL.md` inside. Don't append `/SKILL.md` to those.

Existing skills authored outside `/conjure` are the most common offenders. Generated skills always use uppercase `SKILL.md` in a directory; pre-existing ones may not.

---

## Phase 5: Format generated files

Before printing the summary, run the repo's formatter on every file conjure created or modified in this run. Skipping this is the most common reason a fresh `/conjure` run fails CI on first push.

### Step 1 — Detect the formatter

Inspect the repo for a known formatter, in this priority order:

1. `package.json` `scripts.format` / `scripts.format:fix` / `scripts.lint:fix` (Node)
2. `oxfmt` config (`.oxfmtrc.json`, `.oxfmtrc`)
3. `prettier` config (`.prettierrc*`, `prettier.config.*`, `prettier` key in `package.json`)
4. `biome.json` / `biome.jsonc`
5. `dprint.json` / `.dprint.json`
6. Python: `ruff.toml`, `pyproject.toml` with `[tool.ruff]` or `[tool.black]`
7. Go: `gofmt` / `goimports` (always available with Go installed)
8. Rust: `rustfmt.toml` or just run `cargo fmt`

### Step 2 — Run it on the new files only

Do NOT run the formatter across the whole repo (that would create unrelated diffs). Pass only the files conjure created or modified:

```bash
# Example: oxfmt-based monorepo
pnpm oxfmt <generated-file-1> <generated-file-2> ...

# Example: prettier
pnpm prettier --write <files...>

# Example: biome
pnpm biome format --write <files...>
```

### Step 3 — Verify

Run the format-check variant on the same files (e.g., `oxfmt --check`, `prettier --check`, `biome format`) and confirm zero issues. If the project also has a husky / pre-commit hook, mention in the summary that the hook will format-on-commit and the user should re-run `git add` after a successful commit.

If no formatter is detected, skip silently — do not invent one.

---

## Phase 6: Summary

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
Formatter           | oxfmt (11 files)                       | Passed
```

Also surface any items the user must resolve manually:

- **Contradictions flagged in Phase 4/4b** — list each CLAUDE.md or AGENTS.md gotcha that disagrees with its tech skill, with both wordings and a recommendation.
- **Unverified claims dropped in Phase 2** — if any agent dropped a "default" claim because it could not be verified, list the technology so the user knows the gotcha section may be thinner than expected.

Then print: "Skills conjured. Pi and other Agent Skills-compatible tools can now discover the generated `.agents/skills`; Claude Code can use the mirrored `.claude/skills` when generated."

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
