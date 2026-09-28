# Event Map (`pi.on`)

Subscribe with `pi.on(name, (event, ctx) => ...)` in the extension factory. The `ExtensionAPI["on"]` overloads define each event's type and supported return value. Results from notification-only events are ignored. A typical sequence is `session_start` -> `resources_discover` -> `input` -> `before_agent_start` -> `agent_start` -> `turn_start`/`context`/provider and tool hooks/`turn_end` -> `agent_end` -> `agent_settled`. Consult the installed Senpi `docs/extensions.md` for exact ordering.

## Trust, Resources, and Sessions

| Event | When and why | Return value or caveat |
| --- | --- | --- |
| `project_trust` | Resolve trust **before** loading project resources. Only user/global or CLI extensions participate | Return `{ trusted: "yes" \| "no" \| "undecided", remember? }`; a project extension cannot intercept its own trust decision |
| `resources_discover` | Supply additional skill, prompt, theme, and hook paths after session start or reload | Return `skillPaths`, `promptPaths`, `themePaths`, or `hookPaths`; scope follows the host contract |
| `session_start` | Initialize or restore state after `startup`, `reload`, `new`, `resume`, or `fork` | Start session-scoped resources here; stop them at shutdown |
| `session_info_changed` | React to a session display-name change | Update UI or external labels |
| `session_parked`, `session_resumed` | Last RPC client disconnects or first client reconnects to a retained session | The session remains alive; pause or resume optional work |
| `session_before_switch` | Before creating or switching sessions | May return `{ cancel: true }` |
| `session_before_fork` | Before `/fork` or `/clone` | May return `{ cancel: true }` or `skipConversationRestore` |
| `session_before_reload` | Veto a full extension/config/skill reload | Return `{ cancel: true, reason }`; keep the check fast |
| `session_before_compact` | Before summarizing conversation history | Return `{ cancel: true }` or `{ compaction }`; inspect `preparation` and `signal` |
| `session_compact` | Compaction outcome | Read `compactionEntry` only when `event.accepted` is true |
| `session_compact_failed` | Failed or aborted compaction | Inspect error, abort, and retry information |
| `session_before_tree`, `session_tree` | Before and after tree navigation/branch summarization | Before: cancel or supply a summary; after: restore branch-specific state |
| `session_abort` | Current session operation is aborted | Stop related external work |
| `session_extensions_removed` | Active extensions are removed | Clean up dependent state or UI |
| `session_shutdown` | Old runtime is torn down on exit, reload, or session replacement | Clean up within the shutdown budget and honor `event.signal` |

## Agent, Messages, and Models

| Event | Purpose | Return value or caveat |
| --- | --- | --- |
| `before_agent_start` | Compose an extra message or system prompt before each request | Return `{ message, systemPrompt }`; use `previewSafe: true` only for side-effect-free preview handlers |
| `agent_start` | Agent execution begins | Start metrics or status indicators |
| `agent_end` | Low-level run ends | Retries or follow-up messages may still remain |
| `agent_settled` | Retries, compaction, and follow-ups are finished | Report externally visible completion here |
| `ui_prompt_start`, `ui_prompt_end` | A blocking user dialog opens or closes | Show "waiting for user"; overlapping prompts share one span |
| `turn_start`, `turn_end` | A model response and its tool calls begin or end | Measure turn index, message, and tool results |
| `message_start`, `message_update`, `message_end` | User/assistant/tool message creation, streaming, and completion | `message_end` can return `{ message }` to replace the final message while preserving its role |
| `model_select` | Model first selected, changed, or restored | Update provider-specific UI using `model`, `previousModel`, and `source` |
| `thinking_level_select` | Thinking level changes | Notification only |
| `system_prompt_change` | Effective system prompt changes | Update prompt-related state |

## Request, Tool, and Input Pipeline

| Event | Purpose | Return value or caveat |
| --- | --- | --- |
| `context` | Transform request-local messages before each LLM call | Return `{ messages }`; persisted session entries are unchanged |
| `before_provider_headers` | Change outgoing provider request headers | Mutate `event.headers`; `null` deletes a header; retries do not rerun the hook |
| `before_provider_request` | Inspect or replace serialized provider payload | `undefined` keeps it; any other return value replaces it |
| `after_provider_response` | Observe HTTP response before consuming its stream | Status and headers may depend on the transport |
| `tool_execution_start`, `tool_execution_update`, `tool_execution_end` | Observe tool start, progress, and completion | Updates from parallel tools can interleave |
| `tool_call` | Check permissions or change arguments before execution | Return `{ block: true, reason?, terminate? }`; mutate `event.input` directly, with no subsequent revalidation |
| `tool_result` | Patch a completed result before later handlers and the model see it | Return any of `{ content?, details?, isError?, usage? }`; result guards are re-exported in `src/api/tools.ts` |
| `user_bash` | Replace a user's `!` or `!!` shell command | Return `{ operations }` or `{ result }`; distinct from model-dispatched `bash` |
| `input` | Handle raw user input after extension commands but before skill/template expansion | Return `{ action: "continue" \| "transform" \| "handled", ... }`; transformations chain |
| `input_disposition` | Observe how input was handled | Useful for post-dispatch notifications and metrics |

Narrow built-in tool arguments with `isToolCallEventType("bash", event)` and similar guards. For a custom tool, use `isToolCallEventType<"tool_name", Input>("tool_name", event)`. A simple `event.toolName === "bash"` does not narrow the built-in input type because custom tool names have the overlapping `string` type.

```ts
import { isToolCallEventType } from "@code-yeongyu/senpi"
import type { ExtensionAPI } from "@code-yeongyu/senpi"

export default function extension(pi: ExtensionAPI): void {
  pi.on("tool_call", (event) => {
    if (isToolCallEventType("bash", event) && event.input.command.includes("rm -rf")) {
      return { block: true, reason: "Explicit confirmation required" }
    }
  })
}
```

Project code can also import the re-export from `src/api/tools.ts` using a relative path such as `./api/tools.js`.
