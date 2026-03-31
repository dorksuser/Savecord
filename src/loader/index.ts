import { join } from "path";
import { existsSync } from "fs";
import { spawn, ChildProcess } from "child_process";
import { initUpdateService } from "../main/update-service";
import { initPrivacyManager } from "../main/privacy-manager";

const ORIGINAL_ASAR = join(__dirname, "../../app.asar");
const PRELOAD_PATH = join(__dirname, "preload.js");
const PRIVACY_CONFIG_PATH = join(process.cwd(), "config", "privacy.json");

class ZapretService {
  private process: ChildProcess | null = null;
  private strategies = [
    "--wf-tcp=443 --dpi-desync=fake,split2 --dpi-desync-ttl=5",
    "--wf-tcp=80,443 --wf-udp=443,50000-65535",
    "--wf-tcp=80,443 --wf-udp=443 --filter-udp=443",
  ];
  private currentStrategyIndex = 0;
  private readonly exePath = join(process.cwd(), "bin", "zapret", "winws.exe");

  start() {
    if (!existsSync(this.exePath)) {
      console.log("[Zapret] winws.exe not found, skipping DPI bypass");
      return;
    }

    const strategy = this.strategies[this.currentStrategyIndex];

    try {
      this.process = spawn(this.exePath, strategy.split(" "), {
        detached: false,
        stdio: "ignore",
      });

      console.log(`[Zapret] Started with strategy ${this.currentStrategyIndex + 1}: ${strategy}`);

      this.process.on("error", (err) => {
        console.error("[Zapret] Failed to start:", err.message);
      });

      this.process.on("exit", (code) => {
        console.log(`[Zapret] Process exited with code ${code}`);
        this.process = null;
      });
    } catch (err) {
      console.error("[Zapret] Error:", err);
    }
  }

  restart() {
    this.stop();
    
    // Rotate to next strategy
    this.currentStrategyIndex = (this.currentStrategyIndex + 1) % this.strategies.length;
    
    setTimeout(() => {
      this.start();
      console.log("[Zapret] Restarted with new strategy");
    }, 1000);
  }

  stop() {
    if (this.process && !this.process.killed) {
      this.process.kill();
      console.log("[Zapret] Process terminated");
    }
  }
}

const zapret = new ZapretService();

async function init() {
  // Initialize privacy manager (telemetry blocking, proxy, etc.)
  const privacyManager = initPrivacyManager(PRIVACY_CONFIG_PATH);
  console.log("[Savecord] Privacy manager initialized");
  
  // Initialize update service
  initUpdateService();
  
  zapret.start();

  const electron = require("electron");

  electron.app.on("will-quit", () => {
    zapret.stop();
  });

  if (existsSync(ORIGINAL_ASAR)) {
    require(ORIGINAL_ASAR);
  }

  electron.app.on("browser-window-created", (_: any, window: any) => {
    window.webContents.on("did-finish-load", () => {
      // Inject fingerprint spoofing script early
      if (privacyManager.getSettings().spoofFingerprint) {
        window.webContents.executeJavaScript(`
          (function() {
            'use strict';
            const STANDARD_SCREEN = { width: 1920, height: 1080, availWidth: 1920, availHeight: 1040 };
            const STANDARD_LANGUAGES = ['en-US', 'en'];
            
            Object.defineProperty(navigator, 'languages', {
              get: () => STANDARD_LANGUAGES,
              configurable: false
            });
            
            Object.defineProperty(navigator, 'language', {
              get: () => 'en-US',
              configurable: false
            });
            
            Object.defineProperty(navigator, 'plugins', {
              get: () => [],
              configurable: false
            });
            
            Object.defineProperty(navigator, 'webdriver', {
              get: () => false,
              configurable: false
            });
            
            console.log('[Savecord Privacy] Fingerprint spoofing injected from main process');
          })();
        `);
      }
      
      if (existsSync(PRELOAD_PATH)) {
        window.webContents.executeJavaScript(
          `require("${PRELOAD_PATH.replace(/\\/g, "/")}")`
        );
      }

      // Listen for Zapret restart requests from renderer
      electron.ipcMain.on("savecord:zapret:restart", () => {
        zapret.restart();
        window.webContents.send("savecord:zapret:restarted");
      });
    });
  });
}

init();
