/// <reference types="node" />

import { existsSync, readFileSync, writeFileSync, createWriteStream, unlinkSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { IncomingMessage } from "node:http";
import * as https from "node:https";
import AdmZip from "adm-zip";

// Simple HTTP client without external dependencies
function httpsGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { "User-Agent": "Savecord-Client/1.0.0" }
    }, (res: IncomingMessage) => {
      let data = "";
      res.on("data", (chunk: Buffer) => data += chunk);
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
  });
}

// Simple ZIP extractor without yauzl
function extractZip(zipPath: string, targetFiles: string[], outputDir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const zip = new AdmZip(zipPath);
      const entries = zip.getEntries();
      
      let extractedCount = 0;
      
      entries.forEach((entry: AdmZip.IZipEntry) => {
        const fileName = entry.entryName.split("/").pop() || "";
        if (targetFiles.includes(fileName)) {
          zip.extractEntryTo(entry, outputDir, false, true);
          extractedCount++;
        }
      });
      
      if (extractedCount === targetFiles.length) {
        resolve();
      } else {
        reject(new Error(`Only extracted ${extractedCount}/${targetFiles.length} files`));
      }
    } catch (err) {
      reject(err);
    }
  });
}

interface GitHubRelease {
  tag_name: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
  }>;
}

export class UpdateService {
  private readonly zapretPath = join(process.cwd(), "bin", "zapret");
  private readonly versionFile = join(this.zapretPath, "version.txt");
  private readonly requiredFiles = ["winws.exe", "WinDivert.dll", "WinDivert64.sys"];
  
  async checkForUpdates(): Promise<void> {
    try {
      const currentVersion = this.getCurrentVersion();
      const latestRelease = await this.getLatestRelease();
      
      if (this.isNewerVersion(latestRelease.tag_name, currentVersion)) {
        console.log(`[UpdateService] New version available: ${latestRelease.tag_name}`);
        await this.downloadAndUpdate(latestRelease);
      }
    } catch (err: unknown) {
      console.error("[UpdateService] Update check failed:", err);
    }
  }
  
  private getCurrentVersion(): string {
    try {
      if (existsSync(this.versionFile)) {
        return readFileSync(this.versionFile, "utf8").trim();
      }
    } catch (err: unknown) {
      // Silent fail
    }
    return "0.0.0";
  }
  
  private async getLatestRelease(): Promise<GitHubRelease> {
    const data = await httpsGet("https://api.github.com/repos/flowseal/zapret-discord-youtube/releases/latest");
    return JSON.parse(data);
  }
  
  private isNewerVersion(remote: string, local: string): boolean {
    const parseVersion = (v: string) => {
      return v.replace(/^v/, "").split(".").map(Number);
    };
    
    const remoteVer = parseVersion(remote);
    const localVer = parseVersion(local);
    
    for (let i = 0; i < Math.max(remoteVer.length, localVer.length); i++) {
      const r = remoteVer[i] || 0;
      const l = localVer[i] || 0;
      
      if (r > l) return true;
      if (r < l) return false;
    }
    
    return false;
  }
  
  private async downloadAndUpdate(release: GitHubRelease): Promise<void> {
    const zipAsset = release.assets.find(asset => 
      asset.name.toLowerCase().includes("win") && 
      asset.name.toLowerCase().endsWith(".zip")
    );
    
    if (!zipAsset) {
      throw new Error("No Windows ZIP asset found");
    }
    
    // Kill existing winws process
    await this.killWinws();
    
    const tempZipPath = join(this.zapretPath, "temp_update.zip");
    
    try {
      await this.downloadFile(zipAsset.browser_download_url, tempZipPath);
      await extractZip(tempZipPath, this.requiredFiles, this.zapretPath);
      
      // Update version file
      writeFileSync(this.versionFile, release.tag_name);
      
      console.log(`[UpdateService] Successfully updated to ${release.tag_name}`);
    } finally {
      // Cleanup temp file
      try {
        if (existsSync(tempZipPath)) {
          unlinkSync(tempZipPath);
        }
      } catch (err: unknown) {
        // Silent cleanup
      }
    }
  }
  
  private async downloadFile(url: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = createWriteStream(outputPath);
      
      const req = https.get(url, (res: IncomingMessage) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        
        res.pipe(file);
        
        file.on("finish", () => {
          file.close();
          resolve();
        });
        
        file.on("error", (err: Error) => {
          unlinkSync(outputPath);
          reject(err);
        });
      });
      
      req.on("error", reject);
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error("Download timeout"));
      });
    });
  }
  
  private async killWinws(): Promise<void> {
    return new Promise((resolve) => {
      const killProcess = spawn("taskkill", ["/F", "/IM", "winws.exe"], {
        stdio: "ignore",
      });
      
      killProcess.on("close", () => {
        // Wait a bit for process to fully terminate
        setTimeout(resolve, 1000);
      });
      
      killProcess.on("error", () => {
        // Process might not be running, continue anyway
        resolve();
      });
    });
  }
}

export function initUpdateService(): void {
  const updateService = new UpdateService();
  
  // Check for updates on startup (with delay to avoid boot CPU spike)
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(() => {
      setTimeout(() => {
        updateService.checkForUpdates();
      }, 5000);
    });
  } else {
    setTimeout(() => {
      updateService.checkForUpdates();
    }, 5000);
  }
  
  // Check for updates every 6 hours
  setInterval(() => {
    updateService.checkForUpdates();
  }, 6 * 60 * 60 * 1000);
}
