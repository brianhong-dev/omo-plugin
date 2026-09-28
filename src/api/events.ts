import type { ExtensionAPI } from "@code-yeongyu/senpi"

/** All lifecycle, agent, model, tool and input events keep Senpi's on() overloads. */
export type EventAPI = Pick<ExtensionAPI, "on">
