# Senpi extension starter

This TypeScript starter is for building a Senpi extension distributed as an npm package. The example extension registers a session-start notification, the `starter_echo` tool, and the `/starter` command. The default export in `src/index.ts` is the extension factory; `pi.extensions` in `package.json` points to its compiled entry point.

## Project-only development skill

AI agents working in this repository should consult `.agents/skills/senpi-extension-development/SKILL.md`. It provides a workflow for choosing APIs and detailed references for events, factory methods, session and UI contexts, and implementation patterns. Once Senpi trusts this project, you can also load it explicitly with `/skill:senpi-extension-development`. The skill belongs to this repository only and is not included in the npm package.

## Getting started

```sh
bun install
bun run check
senpi -e .
```

`senpi -e .` loads the package manifest from the current directory. Once running, invoke `/starter` to check the command or ask the model to call `starter_echo`. After changing the source, run `bun run build`, then use Senpi's `/reload` or restart Senpi.

When using this starter for a new plugin, update `name`, `version`, `description`, and `license` in `package.json`, the copyright notice in `LICENSE`, and this README. Choose an available npm package name. Rename the starter tool and command to match your feature.

## API modules

`src/api/core.ts` re-exports Senpi's public types. New APIs are therefore available through `PluginAPI` (`ExtensionAPI`) and `PluginContext` (`ExtensionContext`) even before a focused module lists them. The focused modules use `Pick` on the upstream types rather than duplicating method signatures or event overloads.

| Module | Included APIs |
| --- | --- |
| `api/events` | The complete `on` overload for project trust, resources, sessions, agents, models, tools, and input events |
| `api/tools` | Tool registration and execution, filesystem policies, lazy activation, read classifiers, `defineTool`, and type guards |
| `api/commands` | Commands, shortcuts, CLI flags, and command-only session control context |
| `api/ui` | Message, Markdown, and entry renderers; notifications, dialogs, widgets, editors, and themes |
| `api/session` | Session names, entries, labels, compaction, settings, and system prompts |
| `api/models` | Provider registration, model and thinking-level selection, and the model registry |
| `api/messaging` | Agent messages, the inter-extension event bus, and RPC |
| `api/resources` | MCP server registration and shell execution |
| `api/core` | All public Senpi types and the complete factory and context types |

Feature modules can request only the API surface they need:

```ts
import type { EventAPI, ToolAPI } from "senpi-extension-starter/api"

export function registerFeatures(pi: EventAPI & ToolAPI): void {
  pi.on("tool_call", (event, ctx) => {
    if (event.toolName === "starter_echo") ctx.ui.notify("Echo requested", "info")
  })
}
```

If you rename the package, update the import path above as well. Inside the extension, you can also use a relative import such as `./api/index.js`. The source of truth for types is `@code-yeongyu/senpi`; `typebox` defines tool parameter schemas. Both are peer dependencies provided by the Senpi runtime. When upgrading Senpi, update both the minimum peer version and the development dependency, then run type checking again.

## Publishing

```sh
bun run check
npm pack --dry-run
npm publish --access public
senpi install npm:<package-name>
```

`prepack` runs tests, type checking, and the build. The `files` field limits npm publication to `dist/`, README, and LICENSE. You need an npm login and an available package name before publishing. Use `senpi install ./` for a local installation or `senpi install -l npm:<package-name>` to enable the published package only in the current project.

Senpi discovers the package extension at `dist/index.js` through `pi.extensions`. The `./api` and `./api/*` exports let other plugins reuse types and helper functions. Put additional runtime requirements in `dependencies`, not `devDependencies`: Senpi installs production dependencies, so development-only packages are unavailable at runtime.

This starter follows the installed Senpi `2026.9.27` documentation in `docs/extensions.md` and `docs/packages.md`, and its `dist/core/extensions/types.d.ts`. Some upstream examples still use the older `@earendil-works/pi-coding-agent` name; this project uses the current npm package name, `@code-yeongyu/senpi`.
