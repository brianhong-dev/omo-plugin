# Complete `ExtensionAPI` Map

The default-exported factory receives `pi: ExtensionAPI` from `@code-yeongyu/senpi`. This repository exposes the same type as `PluginAPI` in `src/api/core.ts`, with focused types such as `ToolAPI` and `ModelAPI` under `src/api/`. The groups below distinguish registration, invocation, and runtime state.

## Factory Profile and Registration

| Field or method | Purpose | Timing and distinction |
| --- | --- | --- |
| `cwd`, `sharedHostEnabled`, `sessionKind`, `sessionContext` | Read session cwd, shared-host capability, interactive/worker kind, and opener-supplied labels | Read-only at registration time; context labels are not authorization |
| `on(event, handler)` | Subscribe to lifecycle, request, tool, and input events | Check return types in the [event map](events.md) |
| `registerTool(definition)` | Register a model-callable tool with TypeBox parameters | Register in the factory or dynamically; `execute` returns `content` and `details`, and `onUpdate` emits partial output |
| `registerRemovedToolHint(name, hint)` | Explain how to migrate an intentionally removed tool | Provide actionable guidance when renaming or retiring a tool |
| `registerLazyToolActivator(activator)` | Activate an inactive tool when requested | Return true only after activation actually succeeded |
| `registerFilesystemPolicy(policy)` | Enforce file access for built-in `read`, `write`, `edit`, `ls`, `find`, and `grep` | **Factory only**; receives canonical paths; does not cover `bash` or custom tools |
| `registerMcpServer(name, config)` | Declare an extension-owned MCP server | **Factory only**; see Senpi `docs/mcp.md` for stdio/http fields and name precedence |
| `registerReadClassifier(classifier)` | Classify read results for compact output | Returns an unsubscribe function scoped to the extension lifetime |
| `registerCommand(name, options)` | Register a user `/name` command | Handler receives command-only `ExtensionCommandContext`; argument completion is available |
| `registerShortcut(key, options)` | Register a keyboard shortcut | Handler receives ordinary context, not command context |
| `registerFlag(name, options)` / `getFlag(name)` | Declare and read a boolean/string CLI flag | Respects defaults and CLI values |
| `registerMessageRenderer(type, fn)` | Render a `sendMessage` customType in the TUI | Changes display only; custom messages still enter model context |
| `registerMarkdownTransformer(fn)` | Transform displayed user/assistant Markdown | Display only; original messages remain intact; keep it fast during streaming |
| `registerEntryRenderer(type, fn, options?)` | Render an `appendEntry` customType as a TUI card | Entries stay out of model context; `replaces` can update an adjacent card |

## Messages, Sessions, and Tool Invocation

| Method | Purpose | Caveat |
| --- | --- | --- |
| `sendMessage(message, options?)` | Add a customType message to session and model context | `deliverAs: "steer" \| "followUp" \| "nextTurn"`; `triggerTurn: true` starts a response when idle |
| `sendUserMessage(content, options?)` | Submit a user-role message and start a response | `deliverAs` is required while streaming; use `expandPromptTemplates: true` to expand skills/templates |
| `appendEntry(customType, data?)` | Persist an entry excluded from model context | Restore via `ctx.sessionManager` after reload/restart; consider branches |
| `setSessionName(name)` / `getSessionName()` | Store or read the displayed session name | Changes emit `session_info_changed` |
| `setLabel(entryId, label)` | Add or remove an entry's tree label | Pass `undefined` to clear; labels persist |
| `exec(command, args, options?)` | Run a shell process through the host | Inspect stdout/stderr/code/killed; use abort and timeout options |
| `executeTool(name, params, options?)` | Run an active tool through Senpi's validation, permission, and hook pipeline | Distinct from calling the tool implementation directly |
| `getActiveTools()` | List currently active tool names | Only active tools are available to the model |
| `getAllTools()` | Inspect all configured tool schemas, descriptions, and provenance | Includes inactive tools; use `sourceInfo` to identify built-ins or extensions |
| `setActiveTools(names)` | Replace the entire active-tool list | Preserve existing names when making a partial change |
| `getCommands()` | List invokable extension, template, and skill slash commands | `sourceInfo` identifies origin; built-in TUI commands are excluded |

`registerTool.parameters` is a `typebox` schema; `params` in `execute(toolCallId, params, signal, onUpdate, ctx)` is inferred from it. Do not bypass Senpi's validation boundary by invoking `execute` directly. `promptSnippet` adds a one-line Available tools description, and `promptGuidelines` adds guidance while the tool is active. `executionMode` controls parallel or sequential calls; `exposure` controls direct, search, or code-mode exposure. `renderCall` and `renderResult` control TUI rendering.

## Models and Providers

| Method | Purpose | Caveat |
| --- | --- | --- |
| `registerProvider(provider)` or `registerProvider(name, config)` | Register or override a native provider or a baseUrl/apiKey/models/refreshModels/OAuth configuration | Factory calls apply after context binding; later calls apply immediately |
| `unregisterProvider(name)` | Remove an extension provider and restore overridden built-in models | No effect if absent |
| `setModel(model)` / `setSessionModel(model)` | Select a model for this session | Returns false without authentication; the former records a session-history change, the latter is session-scoped |
| `getThinkingLevel()` | Read the current thinking level | Effective level depends on model capability |
| `setThinkingLevel(level)` / `setSessionThinkingLevel(level)` | Change thinking level | The former records session history, the latter is a transient session setting; levels are clamped |
| `setSessionFastMode(enabled)` | Show a fast-mode indicator in host UI | Display only; does not send `service_tier` to the provider |

Model definitions need fields such as `id`, `name`, `reasoning`, `input`, `cost`, `contextWindow`, and `maxTokens`. `refreshModels` receives a signal for dynamic discovery and can persist catalog entries with `context.publish({ persist: ... })`. Use `ctx.modelRegistry` to inspect active providers and credentials. Per-request header or payload changes belong in provider-request events, not provider registration.

## RPC and Extension Communication

| API | Purpose | Distinction |
| --- | --- | --- |
| `rpc.emit(name, data)` | Emit JSON-serializable extension events to RPC clients | Clients must advertise `extension_events`; not a model message |
| `rpc.handle(name, handler)` | Handle a structured RPC client request | Validate `data: unknown`; does not start a model turn |
| `events.on(name, handler)` / `events.emit(name, data)` | In-process bus shared by extensions loaded in Senpi | Not an RPC wire or session store; unsubscribe with the resource lifecycle |

Use `registerMcpServer` for an MCP resource, `registerTool` for a model-callable tool, `rpc.handle` for client controls, `events.emit` for extension-to-extension notification, and `sendMessage` for model-visible content.
