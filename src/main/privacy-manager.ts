/// <reference types="node" />

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface PrivacySettings {
  blockTelemetry: boolean;
  spoofFingerprint: boolean;
  useProxy: boolean;
  proxyAddress: string;
  sanitizeMetadata: boolean;
}

// Telemetry domains to block (simple string matching for performance)
const TELEMETRY_PATTERNS = Object.freeze([
  "/science",
  "/analytics",
  "/metrics",
  "/track",
  "sentry.io",
  "google-analytics.com",
  "doubleclick.net",
  "facebook.com/tr",
  "hotjar.com",
  "mixpanel.com"
]);

export class PrivacyManager {
  private settings: PrivacySettings;
  private configPath: string;
  
  constructor(configPath: string) {
    this.configPath = configPath;
    this.settings = this.loadSettings();
  }
  
  private loadSettings(): PrivacySettings {
    try {
      const data = readFileSync(this.configPath, "utf8");
      return JSON.parse(data);
    } catch {
      // Default settings
      return {
        blockTelemetry: true,
        spoofFingerprint: true,
        useProxy: false,
        proxyAddress: "socks5://127.0.0.1:9050",
        sanitizeMetadata: true
      };
    }
  }
  
  private saveSettings(): void {
    try {
      writeFileSync(this.configPath, JSON.stringify(this.settings, null, 2));
    } catch (err) {
      console.error("[PrivacyManager] Failed to save settings:", err);
    }
  }
  
  initialize(): void {
    // Lazy load electron to avoid type issues
    const electron = require("electron");
    
    if (this.settings.blockTelemetry) {
      this.setupTelemetryBlocking(electron.session);
    }
    
    if (this.settings.useProxy) {
      this.setupProxy(electron.session);
    }
    
    if (this.settings.sanitizeMetadata) {
      this.setupMetadataSanitizer(electron.session);
    }
  }
  
  private setupTelemetryBlocking(session: any): void {
    const filter = { urls: ["*://*/*"] };
    
    session.defaultSession.webRequest.onBeforeRequest(filter, (details: any, callback: any) => {
      const url = details.url.toLowerCase();
      
      // Fast string matching for performance on Pentium G850
      for (const pattern of TELEMETRY_PATTERNS) {
        if (url.includes(pattern)) {
          console.log("[Privacy] Blocked telemetry:", details.url);
          callback({ cancel: true });
          return;
        }
      }
      
      callback({ cancel: false });
    });
  }
  
  private setupProxy(session: any): void {
    session.defaultSession.setProxy({
      proxyRules: this.settings.proxyAddress,
      proxyBypassRules: "localhost,127.0.0.1"
    }).then(() => {
      console.log("[Privacy] Proxy configured:", this.settings.proxyAddress);
    }).catch((err: Error) => {
      console.error("[Privacy] Proxy setup failed:", err);
    });
  }
  
  private setupMetadataSanitizer(session: any): void {
    const filter = { urls: ["*://*/*"] };
    
    session.defaultSession.webRequest.onBeforeRequest(filter, (details: any, callback: any) => {
      // Only process file uploads
      if (details.method !== "POST" && details.method !== "PUT") {
        callback({ cancel: false });
        return;
      }
      
      // Check if uploading image files
      const url = details.url.toLowerCase();
      if (url.includes("/attachments") || url.includes("/upload")) {
        // Note: Actual EXIF stripping would happen in preload script
        // This is just a marker for the upload process
        console.log("[Privacy] File upload detected, metadata sanitization active");
      }
      
      callback({ cancel: false });
    });
  }
  
  updateSettings(newSettings: Partial<PrivacySettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    
    // Reinitialize with new settings
    this.initialize();
  }
  
  getSettings(): PrivacySettings {
    return { ...this.settings };
  }
}

// Fingerprint spoofing script (injected into renderer)
export const FINGERPRINT_SPOOF_SCRIPT = `
(function() {
  'use strict';
  
  // Standardize to common values for anonymity
  const STANDARD_SCREEN = { width: 1920, height: 1080, availWidth: 1920, availHeight: 1040 };
  const STANDARD_LANGUAGES = ['en-US', 'en'];
  
  // Override navigator.languages
  Object.defineProperty(navigator, 'languages', {
    get: () => STANDARD_LANGUAGES,
    configurable: false
  });
  
  // Override navigator.language
  Object.defineProperty(navigator, 'language', {
    get: () => 'en-US',
    configurable: false
  });
  
  // Override navigator.plugins (empty for privacy)
  Object.defineProperty(navigator, 'plugins', {
    get: () => [],
    configurable: false
  });
  
  // Override navigator.webdriver
  Object.defineProperty(navigator, 'webdriver', {
    get: () => false,
    configurable: false
  });
  
  // Override screen dimensions
  Object.defineProperty(screen, 'width', {
    get: () => STANDARD_SCREEN.width,
    configurable: false
  });
  
  Object.defineProperty(screen, 'height', {
    get: () => STANDARD_SCREEN.height,
    configurable: false
  });
  
  Object.defineProperty(screen, 'availWidth', {
    get: () => STANDARD_SCREEN.availWidth,
    configurable: false
  });
  
  Object.defineProperty(screen, 'availHeight', {
    get: () => STANDARD_SCREEN.availHeight,
    configurable: false
  });
  
  // Override window dimensions to standard
  Object.defineProperty(window, 'innerWidth', {
    get: () => STANDARD_SCREEN.width,
    configurable: false
  });
  
  Object.defineProperty(window, 'innerHeight', {
    get: () => STANDARD_SCREEN.availHeight,
    configurable: false
  });
  
  // Override canvas fingerprinting
  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function(...args) {
    // Add slight noise to prevent fingerprinting
    const ctx = this.getContext('2d');
    if (ctx) {
      const imageData = ctx.getImageData(0, 0, this.width, this.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = imageData.data[i] ^ 1; // XOR with 1 for minimal change
      }
      ctx.putImageData(imageData, 0, 0);
    }
    return originalToDataURL.apply(this, args);
  };
  
  // Override WebGL fingerprinting
  const getParameter = WebGLRenderingContext.prototype.getParameter;
  WebGLRenderingContext.prototype.getParameter = function(parameter) {
    // Return generic values for fingerprinting parameters
    if (parameter === 37445) return 'Intel Inc.'; // UNMASKED_VENDOR_WEBGL
    if (parameter === 37446) return 'Intel HD Graphics'; // UNMASKED_RENDERER_WEBGL
    return getParameter.call(this, parameter);
  };
  
  console.log('[Savecord Privacy] Fingerprint spoofing active');
})();
`;

export function initPrivacyManager(configPath: string): PrivacyManager {
  const manager = new PrivacyManager(configPath);
  manager.initialize();
  return manager;
}
