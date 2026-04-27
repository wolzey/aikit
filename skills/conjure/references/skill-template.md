# Generated Skill Template

Use this template when generating per-technology skills in Phase 3. Replace all `<placeholders>` with real, repo-specific content.

---

## SKILL.md Format

```markdown
---
name: <tech-kebab-case>
description: |
  <Repo Name> <Technology> patterns and conventions.
  Use when: <comma-separated list of specific trigger contexts>.
user-invocable: false
---

# <Technology> — <Repo Name>

<1-2 sentences: how this technology is used in THIS repo. Include the version if known.
Mention the key structural decision — e.g., "NestJS services follow a modular architecture
with shared libraries in libs/shared/nest/" or "Prisma is used with PostgreSQL across 3
services, each with their own schema.">

## Patterns

### <Pattern 1 Name>

<Explanation of the pattern and why it's used.>

```typescript
// From: <real/file/path.ts>:<line>
<actual code snippet from the repo — 5-15 lines showing the pattern>
```

### <Pattern 2 Name>

<Explanation.>

```typescript
// From: <real/file/path.ts>:<line>
<actual code snippet>
```

### <Pattern 3 Name>

<Explanation.>

```typescript
// From: <real/file/path.ts>:<line>
<actual code snippet>
```

## Conventions

- **File naming**: <how files are named — e.g., "kebab-case with .service.ts, .controller.ts, .module.ts suffixes">
- **Directory structure**: <where things live — e.g., "each module in its own directory under src/ with co-located tests">
- **Imports**: <import ordering or aliasing conventions — e.g., "path aliases via @app/* and @shared/*">
- **Exports**: <barrel exports, named exports, default exports>
- **Naming**: <class, function, variable naming patterns>
- **Error handling**: <how errors are thrown and caught with this technology>

## Common Workflow: <Most Common Task>

When <doing the most common task with this technology>:

1. <Step 1 with exact command or file to create/edit>
2. <Step 2>
3. <Step 3>
4. <Step 4>
5. <Verification step — test command, build command, or manual check>

## Anti-Patterns

### WARNING: <Anti-Pattern Name>

<What the anti-pattern looks like and why it's harmful. If found in the repo,
reference the specific file. If it's a common mistake for this stack, explain
what to do instead.>

```typescript
// BAD — don't do this:
<bad pattern>

// GOOD — do this instead:
<correct pattern>
```

## References

- [Detailed patterns and examples](references/patterns.md)

## Related Skills

- **<other-skill>** — <what it covers and how it relates>
```

---

## references/patterns.md Format

```markdown
# <Technology> Patterns — Detailed Reference

## <Pattern Category 1>

### <Specific Pattern>

**Where**: `<file/path.ts>`, `<another/file.ts>`

**What**: <Detailed explanation of the pattern.>

**Why**: <Why this pattern is used in this repo specifically.>

```typescript
// From: <real/file/path.ts>:<line>
<extended code example — 10-30 lines>
```

**Variations**: <If the pattern has variations across the repo, show them.>

### <Another Pattern>

...

## <Pattern Category 2>

...

## Edge Cases & Gotchas

- <Gotcha 1 with file reference>
- <Gotcha 2 with file reference>
- <Gotcha 3>
```

---

## Quality Checklist

Before writing a generated skill, verify:

- [ ] Every code snippet references a real file path that exists in the repo
- [ ] The `description` field includes "Use when:" with 3+ specific trigger contexts
- [ ] At least 3 patterns are documented with code examples
- [ ] At least 1 anti-pattern is documented
- [ ] The common workflow includes exact commands
- [ ] Related skills are cross-linked
- [ ] File naming and directory conventions are specific (not generic)
- [ ] The skill is 80-130 lines (move excess to references/)
- [ ] `references/patterns.md` is 3000-6000 characters
- [ ] `user-invocable` is set to `false`

### Security & accuracy gates (added in v2)

- [ ] No security-sensitive API (postMessage `"*"`, innerHTML, eval, raw SQL,
      etc. — see [security-flags.md](security-flags.md)) appears in a snippet
      without a `// SECURITY:` comment OR is flagged as an anti-pattern.
- [ ] Every "default" / "implicit" / "automatic" / "by default" claim about a
      library cites a real source — either a `file:line` in this repo that
      sets the value, or a context7/web fetch of the library's docs for the
      exact version in use. Unverified default claims have been dropped.
- [ ] Every gotcha that names a config knob (mode, retry, staleTime, timeout,
      etc.) either points at a config file in this repo or is hedged with the
      library name + version (e.g., "RHF 7.x defaults to ...").
- [ ] If the skill makes a claim that a `CLAUDE.md` / `AGENTS.md` gotcha
      contradicts, the contradiction is logged in the Phase 5 summary so the
      user can resolve it.
- [ ] Every link to another skill (in "Related Skills" or in an `AGENTS.md`
      manifest row) has been verified against `git ls-files` — NOT the local
      filesystem. macOS / Windows are case-insensitive; GitHub and Linux CI
      are case-sensitive. Links to `SKILL.md` may need to be `skill.md`, and
      some skills are single files (no `/SKILL.md` suffix).

---

## Description Trigger Examples

The `description` field is critical for auto-loading. Here are examples of good trigger contexts:

| Technology | Good "Use when:" Triggers |
|-----------|--------------------------|
| NestJS | editing .ts files in apps/ or services/, working with @Module/@Injectable/@Controller, creating NestJS modules/services/controllers/guards, adding API endpoints |
| Prisma | editing schema.prisma, writing database queries with PrismaClient, creating migrations, working with @prisma/client imports, adding or modifying database models |
| React | editing .tsx/.jsx files with component code, working with hooks (useState/useEffect/useContext), creating React components, modifying component props or state |
| Next.js | editing files in app/ or pages/ directories, working with server components, configuring next.config, creating API routes, working with middleware.ts |
| TypeScript | editing .ts/.tsx files, configuring tsconfig.json, working with type definitions, creating interfaces or type aliases, fixing type errors |
| Jest | writing or editing test files (*.spec.ts, *.test.ts), creating test fixtures, configuring jest, debugging test failures |
| Docker | editing Dockerfile or docker-compose.yml, configuring container builds, working with multi-stage builds |
| Tailwind | editing className attributes, configuring tailwind.config, adding custom utilities, working with responsive/state variants |
| GraphQL | editing .graphql schema files, writing resolvers, creating queries/mutations, working with Apollo or GraphQL codegen |
| Prisma + NestJS | creating a new NestJS service that needs database access, adding repository patterns |
