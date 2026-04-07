# aikit

A toolkit of [Claude Code](https://docs.anthropic.com/en/docs/claude-code) skills for codebase analysis and developer productivity.

## Install

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

**Example output:**

After running `/conjure` in a NestJS + Prisma project, your repo gets:

```
.claude/skills/
  nestjs/
    SKILL.md              # Auto-loads when editing NestJS services
    references/
      patterns.md         # Detailed patterns with file references
  prisma/
    SKILL.md              # Auto-loads when touching database code
    references/
      patterns.md
      migrations.md
  typescript/
    SKILL.md              # Auto-loads for any .ts/.tsx file
    references/
      patterns.md
```

Each generated skill contains real code snippets from your repo, not generic documentation. Claude uses these to write code that matches your existing patterns.

## How auto-loading works

Claude Code reads the `description` field from every skill's `SKILL.md` frontmatter. Generated skills include specific trigger contexts like:

> *Use when: editing .ts files in apps/ directories, working with @Module/@Injectable decorators, creating NestJS modules/services/controllers*

When you're working on a file that matches those triggers, Claude loads the skill automatically — giving it instant context about how your repo uses that technology.

## Contributing

PRs welcome. To add a new skill:

1. Create a directory under `skills/<skill-name>/`
2. Add a `SKILL.md` with proper frontmatter ([format reference](skills/conjure/references/skill-template.md))
3. Add reference files, examples, or scripts as needed
4. Test it locally, then open a PR

## License

MIT
