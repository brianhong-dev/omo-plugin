import type { ExtensionAPI } from "@code-yeongyu/senpi"
import { Type } from "typebox"

/**
 * Senpi discovers this default factory through package.json's pi.extensions.
 * Add registrations here; move related features into src/ as the plugin grows.
 */
export default function extension(pi: ExtensionAPI): void {
  pi.on("session_start", (_event, ctx) => {
    if (ctx.hasUI) ctx.ui.notify("Starter extension ready", "info")
  })

  pi.registerTool({
    name: "starter_echo",
    label: "Echo",
    description: "Return the supplied text",
    parameters: Type.Object({ text: Type.String({ description: "Text to repeat" }) }),
    async execute(_toolCallId, params) {
      return { content: [{ type: "text", text: params.text }], details: {} }
    },
  })

  pi.registerCommand("starter", {
    description: "Show the starter extension status",
    handler: async (_args, ctx) => {
      ctx.ui.notify("Starter extension ready", "info")
    },
  })
}
