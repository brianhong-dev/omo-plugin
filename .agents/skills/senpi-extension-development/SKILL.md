---
name: senpi-extension-development
description: API map and implementation workflow for developing Senpi extensions in this repository. Use for tools, event hooks, commands, UI, sessions, model providers, MCP, RPC, and npm packaging.
---

# Senpi Extension Development

This skill is discovered **only in this Git project**. It is not an `AGENTS.md` substitute or an npm package `pi.skills` resource. Senpi discovers `.agents/skills/` after the project is trusted. Installing this repository's npm package elsewhere does not install this development skill.

## Locate the Contract First

- Extension entry point: `export default function extension(pi: ExtensionAPI)` in `src/index.ts`.
- Discovery entry: `pi.extensions: ["./dist/index.js"]` in `package.json`. Run `bun run build` before asking Senpi to load the compiled extension.
- Authoritative types: `dist/core/extensions/types.d.ts` in the installed `@code-yeongyu/senpi` package. `src/api/core.ts` re-exports public types; the other `src/api/*.ts` files expose focused `Pick` types. Do not reproduce upstream overloads by hand.
- Version baseline: `devDependencies["@code-yeongyu/senpi"]` in `package.json`. When the API changes, read the installed declarations and `docs/extensions.md`, `docs/skills.md`, and `docs/packages.md`. Some older examples still use `@earendil-works/pi-coding-agent`; this project imports `@code-yeongyu/senpi`.

## Choose the Relevant Reference

| Task | Read |
| --- | --- |
| Event order, interception results, input and tool hooks | [events.md](references/events.md) |
| Every `pi` registration, state, and invocation API | [factory-api.md](references/factory-api.md) |
| `ctx`, command-only context, `ctx.ui`, and mode behavior | [context-ui.md](references/context-ui.md) |
| Implementation examples, state, package boundaries, verification | [recipes.md](references/recipes.md) |

Read the relevant reference, then confirm exact arguments and results against the installed version's TypeScript declarations.

## Workflow

1. Decide whether the feature **registers** a capability (`pi.register*` in the factory), **reacts** to an event (`pi.on`), or handles a user command (`pi.registerCommand`). The factory may run without a session. Open watchers, timers, and sockets in `session_start` or when a command/tool needs them; close them in `session_shutdown`.
2. Register the feature in the factory and place larger feature modules under `src/`. Validate external input at the tool TypeBox schema or RPC/file boundary. Gate dialogs on `ctx.hasUI` and terminal components on `ctx.mode === "tui"`.
3. Choose a persistence mechanism: `pi.sendMessage` for model-visible content, `pi.appendEntry` for data excluded from model context, or tool result `details` for state restored with the tool result. Account for shutdown, reload, and session branches.
4. Read existing tests for the behavior first. Run `bun run typecheck`, `bun test`, and `bun run build`. Confirm that `dist/index.js` registers the feature through `senpi -e .` or Senpi's actual extension loader. Before npm publication, inspect `npm pack --dry-run`.

## API Boundaries

- `pi.on("tool_call")` can change or block arguments before execution; `pi.on("tool_result")` can change the result afterward. Use `pi.registerTool` to provide a tool and `pi.executeTool` to invoke an existing one through the normal pipeline.
- Events and tools receive `ExtensionContext`. Session switching, editing, and reload methods on `ExtensionCommandContext` are available **only in command handlers**.
- Register `pi.registerFilesystemPolicy` and `pi.registerMcpServer` in the factory. Filesystem policies cover Senpi's built-in file tools, not `bash` or custom tools automatically.
- `pi.events` is the in-process bus between extensions; `pi.rpc` communicates with RPC clients. Neither sends a message to the model like `sendMessage` or `sendUserMessage`.
- Project skill discovery requires project trust. Do not add this skill to `package.json` `files` or `pi` unless shipping it to npm users becomes an explicit product requirement.
