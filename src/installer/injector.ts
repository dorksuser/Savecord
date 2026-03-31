import { existsSync, readFileSync, writeFileSync, copyFileSync } from "fs";
import { join } from "path";
import type { DiscordInstallation } from "./pathfinder";

export interface InjectionResult {
  success: boolean;
  message: string;
  backupPath?: string;
}

export class DiscordInjector {
  private readonly loaderPath: string;

  constructor(loaderPath: string) {
    this.loaderPath = loaderPath.replace(/\\/g, "/");
  }

  inject(installation: DiscordInstallation): InjectionResult {
    const targetFile = join(installation.corePath, "index.js");
    const backupFile = join(installation.corePath, "index.js.bak");

    try {
      if (!existsSync(targetFile)) {
        return {
          success: false,
          message: `Target file not found: ${targetFile}`,
        };
      }

      const originalContent = readFileSync(targetFile, "utf8");

      if (originalContent.includes("Savecord")) {
        return {
          success: false,
          message: "Savecord is already injected",
        };
      }

      copyFileSync(targetFile, backupFile);

      const injectionCode = `// Savecord Injection
require('${this.loaderPath}');

`;

      const newContent = injectionCode + originalContent;

      writeFileSync(targetFile, newContent, "utf8");

      if (!this.verifyInjection(targetFile)) {
        this.rollback(targetFile, backupFile);
        return {
          success: false,
          message: "Injection verification failed, rolled back",
        };
      }

      return {
        success: true,
        message: `Successfully injected into ${installation.variant} v${installation.version}`,
        backupPath: backupFile,
      };
    } catch (err) {
      if (existsSync(backupFile)) {
        this.rollback(targetFile, backupFile);
      }
      return {
        success: false,
        message: `Injection failed: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  uninstall(installation: DiscordInstallation): InjectionResult {
    const targetFile = join(installation.corePath, "index.js");
    const backupFile = join(installation.corePath, "index.js.bak");

    try {
      if (!existsSync(backupFile)) {
        return {
          success: false,
          message: "No backup found, cannot restore",
        };
      }

      copyFileSync(backupFile, targetFile);

      return {
        success: true,
        message: "Successfully restored original Discord",
      };
    } catch (err) {
      return {
        success: false,
        message: `Uninstall failed: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  private verifyInjection(targetFile: string): boolean {
    try {
      const content = readFileSync(targetFile, "utf8");
      return content.includes("Savecord") && content.includes(this.loaderPath);
    } catch {
      return false;
    }
  }

  private rollback(targetFile: string, backupFile: string): void {
    try {
      if (existsSync(backupFile)) {
        copyFileSync(backupFile, targetFile);
      }
    } catch (err) {
      console.error("[Injector] Rollback failed:", err);
    }
  }
}
