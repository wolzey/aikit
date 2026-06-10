# aikit

A toolkit for generating repo-specific AI coding guidance for [pi](https://pi.dev), [Claude Code](https://docs.anthropic.com/en/docs/claude-code), and AGENTS.md-compatible agents.

## Install

### pi

Install as a pi package:

```bash
pi install git:github.com/wolzey/aikit
```

This loads aikit's pi prompt template, bundled skills, and always-on extension. The extension watches file/tool activity and injects lightweight reminders to read generated repo-specific skills from `.agents/skills` or `.claude/skills` when relevant.

### Claude Code

```bash
curl -fsSL https://raw.githubusercontent.com/wolzey/aikit/main/install.sh | bash
```

This clones the repo to `~/.aikit` and symlinks all skills into `~/.claude/skills/`.

### Update

Re-run the install command — it pulls the latest changes automatically.

### Uninstall

```bash
curl -fsSL https://raw.githubusercontent.com/wolzey/aikit/main/uninstall.sh | bash
```

## Skills

### `/conjure`

Analyzes a repository, discovers every technology in use, and generates per-technology Claude Code skills that auto-load as background knowledge.

**What it does:**

1. Scans your repo for technologies — frameworks, ORMs, testing tools, infrastructure, styling, build systems, and more (80+ supported)
2. For each technology, reads actual code to extract patterns, conventions, and anti-patterns specific to *your* repo
3. Generates `.claude/skills/<tech>/` directories with `SKILL.md` and reference files
4. Generated skills auto-load when Claude works with relevant files — no manual setup needed
5. Optionally creates a `.claude/CLAUDE.md` with repo overview, commands, and architecture
6. Optionally creates an `AGENTS.md` at the repo root — the open standard supported by Codex, Cursor, VS Code, Gemini, and other AI coding tools

**Usage:**

Open Claude Code in any repository and run:

```
/conjure
```

Options:

| Flag | Description |
|------|-------------|
| `--update` | Re-analyze and update existing skills |
| `--only nestjs,prisma` | Only analyze specific technologies |
| `--skip-claude-md` | Skip the CLAUDE.md creation prompt |
| `--skip-agents-md` | Skip the AGENTS.md (Codex / Cursor / etc.) creation prompt |

**Example output:**

After running `/conjure` in a NestJS + Prisma project, your repo gets:

```
.agents/
  skills/
    nestjs/
      SKILL.md            # Portable Agent Skill for NestJS repo patterns
      references/
        patterns.md       # Detailed patterns with file references
    prisma/
      SKILL.md            # Portable Agent Skill for database patterns
      references/
        patterns.md
        migrations.md
    typescript/
      SKILL.md            # Portable Agent Skill for .ts/.tsx conventions
      references/
        patterns.md
.claude/                  # Optional Claude Code mirror
  CLAUDE.md               # Repo overview, commands, architecture (Claude Code)
  skills/
    ...
AGENTS.md                 # Repo overview + manifest linking to generated skills
```

When installed in pi, aikit's extension can notice reads/edits/writes to matching files and nudge the model to load the relevant generated skill.

Each generated skill contains real code snippets from your repo, not generic documentation. Claude uses these to write code that matches your existing patterns.

## How loading works

Claude Code reads the `description` field from every skill's `SKILL.md` frontmatter and can auto-load matching skills. Generated skills include specific trigger contexts like:

> *Use when: editing .ts files in apps/ directories, working with @Module/@Injectable decorators, creating NestJS modules/services/controllers*

Pi uses progressive disclosure instead: it discovers skill descriptions, then the model reads full `SKILL.md` files on demand. Aikit's pi extension bridges the gap by watching file/tool activity and injecting a short reminder to read the relevant generated skill before modifying matching code.

## Contributing

PRs welcome. To add a new skill:

1. Create a directory under `skills/<skill-name>/`
2. Add a `SKILL.md` with proper frontmatter ([format reference](skills/conjure/references/skill-template.md))
3. Add reference files, examples, or scripts as needed
4. Test it locally, then open a PR

## License

MIT
