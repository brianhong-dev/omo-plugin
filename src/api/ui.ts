import type { ExtensionAPI, ExtensionUIContext } from "@code-yeongyu/senpi"

/** Custom message, Markdown and session-entry rendering registrations. */
export type RendererAPI = Pick<
  ExtensionAPI,
  "registerMessageRenderer" | "registerMarkdownTransformer" | "registerEntryRenderer"
>
/** Dialogs, notifications, widgets, editors, themes and terminal primitives. */
export type UI = ExtensionUIContext
