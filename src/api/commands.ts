import type { ExtensionAPI, ExtensionCommandContext } from "@code-yeongyu/senpi"

/** User commands, keyboard shortcuts and process CLI flags. */
export type CommandAPI = Pick<
  ExtensionAPI,
  "registerCommand" | "registerShortcut" | "registerFlag" | "getFlag" | "getCommands"
>
/** Session navigation/control actions are available only inside command handlers. */
export type CommandContext = ExtensionCommandContext
