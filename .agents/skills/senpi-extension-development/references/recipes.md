# Implementation Patterns for This Project

## Entry Point and Tools

The starter in `src/index.ts` registers a `starter_echo` tool with `Type.Object` parameters, a `/starter` command, and a `session_start` notification. Replace tool names, descriptions, and schemas with the actual feature. A tool result's `content` is shown to the model; `details` supports rendering and state restoration.

```ts
import type { ExtensionAPI } from "@code-yeongyu/senpi"
import { Type } from "typebox"

export default function extension(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "word_count",
    label: "Word count",
    description: "Count whitespace-separated words in supplied text",
    parameters: Type.Object({ text: Type.String() }),
    async execute(_id, { text }) {
      const count = text.trim() === "" ? 0 : text.trim().split(/\s+/).length
      return { content: [{ type: "text", text: String(count) }], details: { count } }
    },
  })
}
```

`defineTool` preserves schema-based parameter inference when you move a tool definition into a variable or array. `src/api/tools.ts` re-exports tool-result type guards. If a custom tool modifies a file, use the public `withFileMutationQueue` to avoid racing Senpi's built-in `edit` and `write` tools.

## Commands and UI

Register a user-facing `/my-command` with `registerCommand` and use its handler's `ctx`. Provide a non-dialog path in print mode when `ctx.hasUI` is false. Use `getArgumentCompletions` for suggestions. If a command replaces the session, use **only the new** `ctx` passed to `withSession`.

```ts
pi.registerCommand("status", {
  description: "Report current session size",
  handler: async (_args, ctx) => {
    const entries = ctx.sessionManager.getEntries()
    ctx.ui.notify(`${entries.length} entries`, "info")
  },
})
```

## State and Shutdown

- Model-visible information: `pi.sendMessage({ customType, content, display })`.
- Durable state excluded from model context: `pi.appendEntry("feature-state", data)`, then restore from `ctx.sessionManager.getBranch()` in `session_start`.
- State changed by a tool: save it in result `details` and restore from the branch's toolResult entries, preserving tree-branch behavior.
- Process resources: open them in `session_start`, not the factory, and close them in `session_shutdown`. Reload runs a new factory.
- Request-only provider changes: `context` transforms model messages, `before_provider_headers` changes HTTP headers, and `before_provider_request` changes provider payloads. None modifies permanent session entries.

## Project Skill vs. npm Package

This skill lives at `.agents/skills/senpi-extension-development/SKILL.md`. Senpi discovers it after the project is trusted. `package.json` declares only `pi.extensions`, and its `files` list contains `dist`, README, and LICENSE. **Do not add `.agents/skills` to `pi.skills` or `files`**: npm users must not receive this repository-only development skill. In this project, invoke it explicitly with `/skill:senpi-extension-development`.

## Verification

```sh
bun run typecheck
bun test
bun run build
npm pack --dry-run --ignore-scripts
```

Starting Senpi at the repository root discovers this skill after project trust. Check the compiled extension's tools and commands with `senpi -e .`. The `npm pack --dry-run` file list must exclude `.agents/skills` to preserve project-only scope. When validating API contracts, consult the installed `node_modules/@code-yeongyu/senpi/dist/core/extensions/types.d.ts` even if only README or reference text changed.
