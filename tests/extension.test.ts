import { describe, expect, test } from "bun:test"
import { resolve } from "node:path"
import { discoverAndLoadExtensions } from "@code-yeongyu/senpi"

describe("starter extension", () => {
  test("loads through Senpi and echoes the supplied text", async () => {
    // Given: the real Senpi loader and this package's extension entry point.
    const entry = resolve(import.meta.dir, "../src/index.ts")
    const loaded = await discoverAndLoadExtensions([entry], import.meta.dir, import.meta.dir)

    // When: invoke the tool registered by the loaded extension.
    const tool = loaded.extensions.flatMap((item) => [...item.tools.values()])
      .find((item) => item.definition.name === "starter_echo")
    const result = tool
      ? await Reflect.apply(tool.definition.execute, undefined, [
          "call-1", { text: "hello" }, undefined, undefined, undefined,
        ])
      : undefined

    // Then: Senpi loaded the package without errors and the tool returned the input.
    expect(loaded.errors).toEqual([])
    expect(result).toEqual({ content: [{ type: "text", text: "hello" }], details: {} })
  })
})
