import { existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

export interface DiscordInstallation {
  path: string;
  version: string;
  variant: "stable" | "canary" | "ptb";
  corePath: string;
}

export class DiscordPathfinder {
  private readonly searchPaths = [
    join(process.env.LOCALAPPDATA || "", "Discord"),
    join(process.env.LOCALAPPDATA || "", "DiscordCanary"),
    join(process.env.LOCALAPPDATA || "", "DiscordPTB"),
  ];

  findAllInstallations(): DiscordInstallation[] {
    const installations: DiscordInstallation[] = [];

    for (const basePath of this.searchPaths) {
      if (!existsSync(basePath)) continue;

      try {
        const appFolders = readdirSync(basePath)
          .filter((name) => name.startsWith("app-"))
          .sort((a, b) => this.compareVersions(b, a));

        if (appFolders.length === 0) continue;

        const latestApp = appFolders[0];
        const version = latestApp.replace("app-", "");
        const appPath = join(basePath, latestApp);
        const corePath = join(appPath, "modules", "discord_desktop_core");

        if (existsSync(corePath)) {
          installations.push({
            path: appPath,
            version,
            variant: this.getVariant(basePath),
            corePath,
          });
        }
      } catch (err) {
        console.error(`[Pathfinder] Error scanning ${basePath}:`, err);
      }
    }

    return installations;
  }

  findLatestInstallation(): DiscordInstallation | null {
    const installations = this.findAllInstallations();
    if (installations.length === 0) return null;

    return installations.sort((a, b) =>
      this.compareVersions(b.version, a.version)
    )[0];
  }

  private compareVersions(a: string, b: string): number {
    const aParts = a.split(".").map(Number);
    const bParts = b.split(".").map(Number);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aVal = aParts[i] || 0;
      const bVal = bParts[i] || 0;
      if (aVal !== bVal) return aVal - bVal;
    }

    return 0;
  }

  private getVariant(path: string): "stable" | "canary" | "ptb" {
    if (path.includes("DiscordCanary")) return "canary";
    if (path.includes("DiscordPTB")) return "ptb";
    return "stable";
  }
}
