<<<<<<< HEAD
import type { PluginRuntime } from "openclaw/plugin-sdk";

let runtime: PluginRuntime | null = null;

export function setQQBotRuntime(next: PluginRuntime) {
  runtime = next;
}

export function getQQBotRuntime(): PluginRuntime {
  if (!runtime) {
    throw new Error("QQBot runtime not initialized");
  }
  return runtime;
}
=======
import type { PluginRuntime } from "openclaw/plugin-sdk/core";
import { createPluginRuntimeStore } from "openclaw/plugin-sdk/runtime-store";

const { setRuntime: setQQBotRuntime, getRuntime: getQQBotRuntime } =
  createPluginRuntimeStore<PluginRuntime>("QQBot runtime not initialized");
export { getQQBotRuntime, setQQBotRuntime };
>>>>>>> upstream/main
