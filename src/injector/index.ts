import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

function findDiscordPath(): string | null {
  const localAppData = join(homedir(), "AppData", "Local");
  const variants = ["Discord", "DiscordCanary", "DiscordPTB", "DiscordDevelopment"];

  for (const variant of variants) {
    const discordPath = join(localAppData, variant);
    if (!existsSync(discordPath)) continue;

    const versions = require("fs").readdirSync(discordPath).filter((v: string) => v.startsWith("app-"));
    if (versions.length === 0) continue;

    const latestVersion = versions.sort().reverse()[0];
    const resourcesPath = join(discordPath, latestVersion, "resources");

    if (existsSync(resourcesPath)) {
      return resourcesPath;
    }
  }

  return null;
}

function inject() {
  const resourcesPath = findDiscordPath();
  
  if (!resourcesPath) {
    console.error("[Injector] Discord installation not found in %LocalAppData%");
    process.exit(1);
  }

  console.log(`[Injector] Found Discord at: ${resourcesPath}`);

  const appPath = join(resourcesPath, "app");
  const packagePath = join(appPath, "package.json");
  const indexPath = join(appPath, "index.js");

  if (!existsSync(appPath)) {
    mkdirSync(appPath, { recursive: true });
  }

  const loaderPath = join(process.cwd(), "dist", "loader.js").replace(/\\/g, "/");

  writeFileSync(
    packagePath,
    JSON.stringify({ name: "discord", main: "index.js" }, null, 2)
  );

  writeFileSync(
    indexPath,
    `require("${loaderPath}");`
  );

  console.log("[Injector] Successfully shimmed Discord entry point");
  console.log("[Injector] Restart Discord to apply changes");
}

inject();
