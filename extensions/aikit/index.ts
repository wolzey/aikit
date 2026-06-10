import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { existsSync } from "node:fs";
import path from "node:path";

type SkillHint = {
  name: string;
  path: string;
  reason: string;
};

const MAX_HINTS = 5;

export default function aikit(pi: ExtensionAPI) {
  const touchedPaths = new Set<string>();

  pi.on("resources_discover", async (event) => {
    const skillPaths = [
      path.join(event.cwd, ".agents", "skills"),
      path.join(event.cwd, ".claude", "skills"),
    ].filter(existsSync);

    return skillPaths.length > 0 ? { skillPaths } : undefined;
  });

  pi.on("tool_call", async (event) => {
    const candidate = getToolPath(event.toolName, event.input);
    if (candidate) touchedPaths.add(candidate);
  });

  pi.on("before_agent_start", async (event, ctx) => {
    const hints = inferSkillHints(ctx.cwd, Array.from(touchedPaths));
    touchedPaths.clear();

    if (hints.length === 0) return;

    const guidance = [
      "Aikit detected repo-specific guidance that may apply to files touched recently.",
      "Before writing or modifying matching code, read the relevant generated skill file(s):",
      ...hints.slice(0, MAX_HINTS).map((hint) => `- ${hint.reason}: ${hint.path}`),
      "Prefer .agents/skills when present; .claude/skills is supported for compatibility.",
    ].join("\n");

    return {
      systemPrompt: `${event.systemPrompt}\n\n${guidance}`,
    };
  });
}

function getToolPath(toolName: string, input: unknown): string | undefined {
  if (!input || typeof input !== "object") return undefined;
  const record = input as Record<string, unknown>;

  if (["read", "write", "edit"].includes(toolName) && typeof record.path === "string") {
    return record.path;
  }

  return undefined;
}

function inferSkillHints(cwd: string, files: string[]): SkillHint[] {
  const byName = new Map<string, SkillHint>();

  for (const file of files) {
    const normalized = file.replace(/\\/g, "/");
    for (const hint of inferForFile(cwd, normalized)) {
      if (!byName.has(hint.name) && existsSync(path.resolve(cwd, hint.path))) {
        byName.set(hint.name, hint);
      }
    }
  }

  return Array.from(byName.values());
}

function inferForFile(cwd: string, file: string): SkillHint[] {
  const candidates: Array<Omit<SkillHint, "path">> = [];

  if (/\.tsx?$/.test(file)) {
    candidates.push({ name: "typescript", reason: "TypeScript files" });
  }
  if (/\.jsx?$/.test(file)) {
    candidates.push({ name: "javascript", reason: "JavaScript files" });
  }
  if (/schema\.prisma$|prisma\//.test(file)) {
    candidates.push({ name: "prisma", reason: "Prisma schema or database files" });
  }
  if (/\.module\.ts$|\.controller\.ts$|\.service\.ts$|nest-cli\.json$/.test(file)) {
    candidates.push({ name: "nestjs", reason: "NestJS modules, controllers, or services" });
  }
  if (/\.spec\.|\.test\.|jest\.config|vitest\.config|playwright\.config|cypress\.config/.test(file)) {
    candidates.push({ name: "testing", reason: "test files or test configuration" });
  }
  if (/\.css$|\.scss$|tailwind\.config/.test(file)) {
    candidates.push({ name: "styling", reason: "styling files or Tailwind configuration" });
  }
  if (/Dockerfile|docker-compose|\.github\/workflows|\.gitlab-ci\.yml/.test(file)) {
    candidates.push({ name: "infrastructure", reason: "infrastructure or CI files" });
  }

  return candidates.flatMap((candidate) => {
    const agentsPath = `.agents/skills/${candidate.name}/SKILL.md`;
    const claudePath = `.claude/skills/${candidate.name}/SKILL.md`;
    const resolvedAgents = path.resolve(cwd, agentsPath);

    return [{ ...candidate, path: existsSync(resolvedAgents) ? agentsPath : claudePath }];
  });
}
