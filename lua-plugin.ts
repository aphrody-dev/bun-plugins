// SPDX-License-Identifier: Apache-2.0
// Sovereign Bun Plugin for Lua 5.2 Scripts & Compiled Chunks

export interface BunLuaPluginOptions {
  mode?: "source" | "ast" | "eval";
  sandbox?: Record<string, any>;
}

export function luaPlugin(options: BunLuaPluginOptions = {}) {
  const mode = options.mode || "source";

  return {
    name: "bun-plugin-lua",
    setup(build: any) {
      build.onLoad({ filter: /\.lua$/ }, async (args: { path: string }) => {
        const file = (globalThis as any).Bun?.file(args.path);
        const source = file ? await file.text() : await (await import("node:fs/promises")).readFile(args.path, "utf8");

        let exportedContent = "";

        if (mode === "source") {
          exportedContent = `export default ${JSON.stringify(source)};\nexport const rawSource = ${JSON.stringify(source)};`;
        } else {
          exportedContent = `export default { source: ${JSON.stringify(source)}, path: ${JSON.stringify(args.path)} };`;
        }

        return {
          contents: exportedContent,
          loader: "js",
        };
      });
    },
  };
}
