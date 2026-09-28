/** The upstream types remain authoritative when Senpi adds API methods. */
export type * from "@code-yeongyu/senpi"

import type { ExtensionAPI, ExtensionContext } from "@code-yeongyu/senpi"

/** The complete factory API, including every registration and runtime method. */
export type PluginAPI = ExtensionAPI
/** The complete event/tool context (use ExtensionCommandContext for commands). */
export type PluginContext = ExtensionContext
/** Registration-time metadata such as cwd, session kind and context. */
export type PluginProfile = Pick<
  ExtensionAPI,
  "cwd" | "sharedHostEnabled" | "sessionKind" | "sessionContext"
>
