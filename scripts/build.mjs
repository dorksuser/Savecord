import esbuild from "esbuild";

const watch = process.argv.includes("--watch");
const production = !watch;

const common = {
  bundle: true,
  minify: production,
  platform: "node",
  target: "esnext",
  sourcemap: watch ? true : false,
  treeShaking: true,
  drop: production ? ["console", "debugger"] : [],
  legalComments: "none",
  logLevel: "info",
};

const preloadCommon = {
  ...common,
  platform: "browser",
  format: "iife",
  globalName: "Savecord",
};

await Promise.all([
  watch
    ? esbuild.context({
        ...common,
        entryPoints: ["src/injector/index.ts"],
        outfile: "dist/injector.js",
      }).then(ctx => ctx.watch())
    : esbuild.build({
        ...common,
        entryPoints: ["src/injector/index.ts"],
        outfile: "dist/injector.js",
      }),

  watch
    ? esbuild.context({
        ...common,
        entryPoints: ["src/loader/index.ts"],
        outfile: "dist/loader.js",
        external: ["electron"],
      }).then(ctx => ctx.watch())
    : esbuild.build({
        ...common,
        entryPoints: ["src/loader/index.ts"],
        outfile: "dist/loader.js",
        external: ["electron"],
      }),

  watch
    ? esbuild.context({
        ...preloadCommon,
        entryPoints: ["src/preload/index.ts"],
        outfile: "dist/preload.js",
      }).then(ctx => ctx.watch())
    : esbuild.build({
        ...preloadCommon,
        entryPoints: ["src/preload/index.ts"],
        outfile: "dist/preload.js",
      }),
]);

console.log(`[Build] Complete ${watch ? "(watching...)" : ""}`);
console.log(`[Build] Mode: ${production ? "PRODUCTION" : "DEVELOPMENT"}`);
console.log(`[Build] Tree-shaking: ${common.treeShaking ? "ENABLED" : "DISABLED"}`);
console.log(`[Build] Console logs: ${production ? "DROPPED" : "KEPT"}`);
