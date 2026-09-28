# Execution Context and UI

Events and tools receive `ExtensionContext`; only commands receive `ExtensionCommandContext`. Use `pi` for registrations and session actions, and `ctx` for session, model, and UI state **at the time of the call**. Never reuse an old `ctx` after reload or session replacement.

## `ExtensionContext` Capabilities

| API | Purpose and timing |
| --- | --- |
| `ui`, `mode`, `hasUI` | User UI; `hasUI` signals dialog availability, while `mode === "tui"` permits direct terminal components. UI may be unavailable or inert in print/json mode |
| `cwd`, `agentDir`, `loadedExtensionPaths?` | Working directory, Senpi state directory, and loaded extensions. Resolve project files relative to `cwd` |
| `sessionManager` | Read-only session entries, branch, leaf, and context. Write through dedicated methods such as `pi.appendEntry` |
| `goalStoreFile?` | Absolute path to the session goal store when available. Do not infer it from the session file |
| `modelRegistry`, `model`, `scopedModels`, `thinkingLevel?` | Available models/authentication, current model, allowed session models, and thinking level |
| `serviceTier`, `effectiveServiceTier?` | Current tier and effective tier including fast mode; optional fields depend on host support |
| `sharedHostEnabled` and related profile fields | Read the registration-time session profile on `pi`, not `ctx` |
| `isIdle()`, `hasPendingMessages()`, `signal`, `steeringSignal?` | Detect active or queued work, cancel nested work, and observe queued steering during a tool call. Steering is not cancellation |
| `isProjectTrusted()` | Check whether local project configuration is trusted before using it |
| `abort(source?)`, `shutdown()` | Abort the current operation or request graceful shutdown; shutdown may wait for idle depending on mode |
| `requestReload?()`, `checkReloadVeto?()` | Request host reload or probe veto. Promise completion does not prove a reload occurred |
| `isCompacting?()`, `getCompactionSettings()`, `getContextUsage()` | Inspect compaction state/settings and token usage |
| `compact(options?)` | Trigger compaction without awaiting it; handle completion with `onComplete`/`onError` |
| `beginCompaction?()`, `updateCompaction?()`, `endCompaction?()` | User-visible feedback lifecycle for an extension-generated summary |
| `getMessageRevision()`, `applyCompaction(result, options)` | Apply a precomputed summary with revision/anchor checks; inspect `applied` |
| `prepareProviderRequest?()`, `getPromptCachePrefixRequest?()` | Request-local provider transformations and safe prompt-prefix preview; distinguish `ready` from `skipped` |
| `getSystemPrompt()`, `getSystemPromptOptions?()` | Effective system prompt and construction inputs, excluding later provider-payload rewrites |
| `getLookAtSettings()`, `getImageSettings()`, `getAskUserSettings?()` | Read look-at, image, and ask-user settings |
| `getPromptCacheSafeWaitSeconds?()`, `getPromptCacheGoalBackstopMaxSeconds?()`, `getPromptCacheKeepAliveSettings?()` | Read current prompt-cache wait and keepalive policy at call time |
| `sessionSettings` | Manage retry fallback settings, chains, enablement, and live status |
| `getLoadedHookSources?()`, `getRegisteredMcpServers?()` | Inspect loaded hook sources and registered MCP servers |
| `updateToolHookStatus?()` | Report progress inside `tool_call`/`tool_result` handlers; ineffective after the handler returns |
| `kernelTools?` | Transient parent host-tool capability during a supported JavaScript eval |

Check that optional (`?`) fields exist before using them. `ctx.signal` is generally present during active execution, and `ctx.model` can be undefined before model selection. For nested provider calls, use `ctx.modelRegistry.streamSimple(model, context, options)` or `stream()` so extension-registered providers and authentication are respected.

## Command-Only `ExtensionCommandContext`

| Method | Purpose and caveat |
| --- | --- |
| `getSystemPromptOptions()` | Base system-prompt inputs; required here, unlike the optional event-context method |
| `waitForIdle()` | Wait through automatic retries, compaction retries, and queued continuations |
| `newSession(options?)` | Create a session; use `setup` for new-session data and `withSession` for its fresh context |
| `fork(entryId, options?)` | Branch before (`before`) or at (`at`) a selected entry |
| `navigateTree(target, options?)` | Move the branch leaf, optionally summarizing the abandoned branch; rejected while streaming |
| `editAssistantMessage(entryId, text, options?)` | Replace an assistant reply with a text-only copy on a new branch; use `expectedLeafId` to avoid stale edits |
| `editUserMessage(entryId, text, options?)` | Copy an edited user prompt while preserving attachments; does not start a turn |
| `switchSession(path, options?)` | Switch to an existing session; `withSession` receives its replacement context |
| `reload()` | Reload extensions, skills, and settings; the old command frame keeps running, so do not use old state afterward |

`withSession` on `newSession`, `fork`, or `switchSession` runs after the previous runtime has shut down. Captured old `pi` or `ctx` objects are stale; use the callback's new context. These methods are unavailable in event and tool contexts, where session-control calls can deadlock.

## `ctx.ui`: Dialogs and Notifications

| Method | Purpose and result |
| --- | --- |
| `select(title, choices, opts?)` | Choose an item; cancellation or timeout returns `undefined` |
| `confirm(title, message, opts?)` | Confirm a choice; cancellation or timeout returns false |
| `input(title, placeholder?, opts?)` | Request one line of text; cancellation returns `undefined` |
| `editor(title, prefill?)` | Edit multiple lines; cancellation returns `undefined` |
| `question?(request, opts?)` | Structured answers, comments, cancellation, or timeout for multiple questions; check host support |
| `notify(message, type?)` | Nonblocking info, warning, or error notification |
| `custom(factory, options?)` | Focus a custom TUI component until `done(value)` resolves it; TUI mode only |
| `onTerminalInput(handler)` | Subscribe to raw terminal input; call the returned unsubscribe function; TUI mode only |

Dialog options can include `signal` or `timeout`. Do not wait for user input when `hasUI` is false. RPC does not implement every TUI-specific component.

## `ctx.ui`: Status, Editor, and Theme

| Method or property | Purpose |
| --- | --- |
| `setStatus(key, text?)` | Add or clear footer status (`undefined` clears it) |
| `setWorkingMessage(message?)`, `setWorkingVisible(visible)`, `setWorkingIndicator(options?)` | Customize streaming loader text, visibility, and frames; omit an argument to restore defaults |
| `setHiddenThinkingLabel(label?)` | Set or restore the label for hidden thinking blocks |
| `setWidget(key, content?, options?)` | Add or clear a widget above/below the editor using strings or a component factory |
| `setFooter(factory?)`, `setHeader(factory?)` | Replace or restore built-in footer/header components |
| `setTitle(title)` | Set the terminal window title |
| `pasteToEditor(text)`, `setEditorText(text)`, `getEditorText()` | Paste into, replace, or read the editor buffer |
| `addAutocompleteProvider(factory)` | Extend built-in command and path completion |
| `setEditorComponent(factory?)`, `getEditorComponent()` | Replace, inspect, or restore the editor component |
| `theme`, `getAllThemes()`, `getTheme(name)`, `setTheme(theme)` | Style with the current theme, list/load themes, and switch with a success/error result |
| `getToolsExpanded()`, `setToolsExpanded(value)` | Read or change tool-output expansion |

Guard components, editors, and raw input with `ctx.mode === "tui"`; release resources and subscriptions in `session_shutdown`. Fire-and-forget UI methods such as `setWidget` are not visible to users in print mode.
