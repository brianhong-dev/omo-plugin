import type { ExtensionAPI, ExtensionContext } from "@code-yeongyu/senpi"

/** Session entries, labels and display name. */
export type SessionAPI = Pick<
  ExtensionAPI,
  "appendEntry" | "setSessionName" | "getSessionName" | "setLabel"
>
/** Session state, settings, compaction, reload and prompt inspection. */
export type SessionCapabilities = Pick<
  ExtensionContext,
  | "sessionManager"
  | "sessionSettings"
  | "getContextUsage"
  | "getCompactionSettings"
  | "getMessageRevision"
  | "getSystemPrompt"
  | "getSystemPromptOptions"
  | "compact"
  | "applyCompaction"
  | "beginCompaction"
  | "updateCompaction"
  | "endCompaction"
  | "requestReload"
  | "checkReloadVeto"
>
