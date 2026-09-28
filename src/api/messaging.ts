import type { ExtensionAPI } from "@code-yeongyu/senpi"

/** Messages to the agent, session-wide event bus and extension RPC channel. */
export type MessagingAPI = Pick<
  ExtensionAPI,
  "sendMessage" | "sendUserMessage" | "rpc" | "events"
>
