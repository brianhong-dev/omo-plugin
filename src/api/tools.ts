import type { ExtensionAPI } from "@code-yeongyu/senpi"

/** Tool definitions, interception helpers, execution and active-tool management. */
export type ToolAPI = Pick<
  ExtensionAPI,
  | "registerTool"
  | "registerRemovedToolHint"
  | "registerLazyToolActivator"
  | "registerFilesystemPolicy"
  | "registerReadClassifier"
  | "executeTool"
  | "getActiveTools"
  | "getAllTools"
  | "setActiveTools"
>

export {
  defineTool,
  isBashToolResult,
  isEditToolResult,
  isFindToolResult,
  isGrepToolResult,
  isLsToolResult,
  isPowerShellToolResult,
  isReadToolResult,
  isToolCallEventType,
  isWriteToolResult,
} from "@code-yeongyu/senpi"
