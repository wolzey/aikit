# Security Flags — Sensitive APIs to Annotate

This file lists the APIs the Phase 2 agent must scan for in every code snippet it records. When a snippet uses one of these APIs, the agent attaches a `// SECURITY:` comment to the snippet itself rather than presenting it as canonical. Existing repo usage is documented as **"WARNING: existing pattern"** — never as "the way to do this."

The goal is not to refactor the repo. The goal is to make sure that when Claude (or another agent) auto-loads the generated skill and writes new code based on it, the agent sees the warning at the same place it sees the pattern.

---

## How to use this list

For each entry below:

1. **What to grep for** — exact substrings or patterns the Phase 2 agent should match against the snippets it collected.
2. **The risk** — one sentence on what goes wrong.
3. **SECURITY comment template** — copy verbatim above the offending line in the snippet, replacing `<...>` placeholders with repo-specific names. Keep it tight (3 lines max) so it doesn't drown the pattern.

If multiple sensitive APIs appear in the same snippet, stack the comments in the order the lines appear.

---

## Browser / DOM

### `window.postMessage(..., "*")`

**Risk**: Wildcard `targetOrigin` delivers the message — including any payload — to any embedding window, including a malicious host.

**Comment template**:
```
// SECURITY: existing code uses "*" for compatibility with multiple parent origins.
// New code should scope the targetOrigin to a trusted parent (e.g.
// process.env.NEXT_PUBLIC_PARENT_ORIGIN). "*" exposes the payload to any embedder.
```

### `innerHTML`, `outerHTML`, `dangerouslySetInnerHTML`, `document.write`

**Risk**: HTML injection / XSS if any part of the assigned string is user-controlled.

**Comment template**:
```
// SECURITY: assigning to innerHTML/outerHTML allows HTML/JS injection if the value
// is ever derived from user input. Prefer textContent, or sanitize via DOMPurify
// (or the project's existing sanitizer) before assigning.
```

### `eval`, `new Function(...)`, `setTimeout("...string...", ...)`, `setInterval("...string...", ...)`

**Risk**: Arbitrary code execution. CSP `unsafe-eval` becomes mandatory.

**Comment template**:
```
// SECURITY: eval / Function-from-string runs arbitrary code and forces
// CSP "unsafe-eval". Replace with a deterministic dispatch table or a sandboxed
// VM (e.g., quickjs-emscripten) if dynamic code is truly required.
```

---

## Node / Server

### `child_process.exec`, `execSync`, `spawn(..., { shell: true })`

**Risk**: Shell injection if any argument is interpolated from user input.

**Comment template**:
```
// SECURITY: exec/execSync/spawn-with-shell runs through /bin/sh; interpolated
// values become shell metacharacters. Use spawn(cmd, [args], { shell: false })
// with array args, or execFile, to keep arguments separated from the command.
```

### Raw SQL via string concatenation / template literals (`db.raw(...)`, `${...}` in queries)

**Risk**: SQL injection.

**Comment template**:
```
// SECURITY: raw SQL with interpolated values is vulnerable to SQL injection.
// Use parameterized queries (the ORM's `$1`/`?`/`:name` binding) or a query
// builder that escapes inputs.
```

### `fs.readFile`, `fs.writeFile`, `path.join` with user-controlled segments

**Risk**: Path traversal — `..` components escape the intended directory.

**Comment template**:
```
// SECURITY: file paths derived from request input must be normalized and
// constrained: resolve against a known root and reject paths whose realpath
// escapes it. path.join alone does NOT prevent traversal.
```

---

## Auth / Session

### `jwt.decode(...)` without `jwt.verify(...)`

**Risk**: Unsigned token contents are trusted.

**Comment template**:
```
// SECURITY: jwt.decode does NOT verify the signature — the payload should never
// be trusted. Use jwt.verify(token, secretOrKey, { algorithms: [...] }) and
// confirm the algorithm is on an explicit allow-list (no "none", no "alg" from
// the token header).
```

### `Set-Cookie` without `httpOnly`, `Secure`, `SameSite`

**Risk**: XSS-readable session cookies, CSRF, MITM in dev/staging.

**Comment template**:
```
// SECURITY: session cookies must set httpOnly + Secure + SameSite=Lax (or Strict).
// Missing httpOnly exposes the cookie to JS (XSS); missing Secure leaks it over
// http; missing SameSite enables CSRF.
```

### CORS `Access-Control-Allow-Origin: *`

**Risk**: Any origin can read responses; combined with credentials, full session theft.

**Comment template**:
```
// SECURITY: "*" allows every origin. If the endpoint ever returns user data or
// is called with credentials: "include", restrict to an explicit allow-list of
// origins (and never combine "*" with credentials — browsers reject it anyway,
// hiding the misconfiguration in some cases).
```

---

## Input Handling

### `new RegExp(userInput)`, `RegExp(userInput)`

**Risk**: ReDoS (catastrophic backtracking) and regex injection.

**Comment template**:
```
// SECURITY: building a RegExp from user input enables ReDoS. Validate the input
// against a strict allow-list, escape regex metacharacters, or use a linear-time
// matcher (e.g., re2) for user-controlled patterns.
```

### `JSON.parse` on untrusted input without size/shape validation

**Risk**: Prototype pollution (`__proto__` / `constructor.prototype` keys), memory exhaustion.

**Comment template**:
```
// SECURITY: parse + validate. Use a schema (Zod, Yup, JSON Schema) before
// trusting parsed values, and reject __proto__ / constructor keys explicitly
// when merging objects.
```

---

## Cryptography

### `crypto.createHash("md5" | "sha1")` for security purposes

**Risk**: Both algorithms are broken for collision resistance.

**Comment template**:
```
// SECURITY: md5/sha1 are broken for security uses (collision attacks). Use
// sha256 or better for fingerprints/HMACs; use bcrypt/scrypt/argon2 for
// password hashing — never a raw hash.
```

### `Math.random()` for tokens / IDs / secrets

**Risk**: Predictable; not cryptographically secure.

**Comment template**:
```
// SECURITY: Math.random is not cryptographically secure — output is predictable
// from observed values. Use crypto.randomUUID() or crypto.randomBytes(n) for
// tokens, session IDs, password reset codes, etc.
```

---

## React / Frontend Specific

### `dangerouslySetInnerHTML={{ __html: ... }}`

**Risk**: XSS if the html string includes user-controlled data without sanitization.

**Comment template**:
```
// SECURITY: dangerouslySetInnerHTML bypasses React's escaping. Sanitize the html
// with DOMPurify (or the project's sanitizer) before passing it; never feed
// user input straight in.
```

### `<a href={userUrl}>` without `noopener`/`noreferrer` for `target="_blank"`

**Risk**: Reverse tabnabbing — opened page can navigate the opener.

**Comment template**:
```
// SECURITY: target="_blank" without rel="noopener noreferrer" lets the opened
// page navigate the opener via window.opener. Modern browsers default to
// noopener but legacy browsers and SSR-rendered HTML may not.
```

---

## Adding new flags

When you discover a pattern not in this list during a `/conjure` run that *should* have been flagged, add it here with the same three-part structure (grep target, risk, comment template). The `--update` flow re-runs Phase 2 and will pick up the new flag.
