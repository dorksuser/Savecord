import esbuild from "esbuild";
import { copyFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";

const common = {
  bundle: true,
  minify: true,
  platform: "node",
  target: "node16",
  format: "cjs",
  sourcemap: false,
  treeShaking: true,
  drop: ["console", "debugger"],
  legalComments: "none",
  logLevel: "info",
  external: ["electron"],
};

await Promise.all([
  esbuild.build({
    ...common,
    entryPoints: ["src/installer/main.ts"],
    outfile: "dist/installer/main.js",
  }),

  esbuild.build({
    ...common,
    entryPoints: ["src/installer/pathfinder.ts"],
    outfile: "dist/installer/pathfinder.js",
  }),

  esbuild.build({
    ...common,
    entryPoints: ["src/installer/injector.ts"],
    outfile: "dist/installer/injector.js",
  }),
]);

// Copy HTML UI
try {
  mkdirSync("dist/installer", { recursive: true });
  copyFileSync("src/installer/ui.html", "dist/installer/ui.html");
} catch (err) {
  console.error("[Build] Failed to copy UI:", err);
}

console.log("[Build] Installer compiled successfully");
console.log("[Build] Format: CommonJS (CJS)");
console.log("[Build] Target: Node 16 (Electron compatible)");
