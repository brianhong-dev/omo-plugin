import type { ExtensionAPI } from "@code-yeongyu/senpi"

/** Register MCP servers or invoke host shell operations from an extension. */
export type ResourceAPI = Pick<ExtensionAPI, "registerMcpServer" | "exec">
