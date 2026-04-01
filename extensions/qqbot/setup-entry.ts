import { defineSetupPluginEntry } from "openclaw/plugin-sdk/core";
<<<<<<< HEAD
import { qqbotPlugin } from "./src/channel.js";

export default defineSetupPluginEntry(qqbotPlugin);
=======
import { qqbotSetupPlugin } from "./src/channel.setup.js";

export { qqbotSetupPlugin } from "./src/channel.setup.js";

export default defineSetupPluginEntry(qqbotSetupPlugin);
>>>>>>> upstream/main
