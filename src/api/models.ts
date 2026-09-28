import type { ExtensionAPI, ExtensionContext } from "@code-yeongyu/senpi"

/** Provider registration and per-session model/thinking selection. */
export type ModelAPI = Pick<
  ExtensionAPI,
  | "registerProvider"
  | "unregisterProvider"
  | "setModel"
  | "setSessionModel"
  | "getThinkingLevel"
  | "setThinkingLevel"
  | "setSessionThinkingLevel"
  | "setSessionFastMode"
>
/** Active model, registry, request preparation and service tier. */
export type ModelContext = Pick<
  ExtensionContext,
  "model" | "modelRegistry" | "serviceTier" | "scopedModels" | "prepareProviderRequest"
>
