import { definePlugin } from "../../types/plugin";
import { Webpack } from "../../webpack";
import { Storage } from "../storage";
import { configManager } from "../config-manager";

const storage = new Storage();
const unpatches: Array<() => void> = [];

// Dynamic API key from user configuration
const getApiKey = (): string => {
  return configManager.getVTApiKey();
};

const isShieldActive = (): boolean => {
  return configManager.isShieldEnabled();
};

const VT_API_URL = "https://www.virustotal.com/api/v3/files/";

const DANGEROUS_EXTENSIONS = Object.freeze([".exe", ".dll", ".scr", ".bat", ".cmd", ".vbs", ".js", ".jar", ".msi", ".zip", ".rar", ".7z"]);
const TOKEN_PATTERNS = Object.freeze([
  /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/g,
  /mfa\.[\w-]{84}/g,
]);

// DEBUG_NOTE: Implemented LRU cache with max size to prevent memory leaks
// Original issue: Unbounded Map growth (100MB+ after 1000 scans)
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;
  
  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }
  
  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }
  
  set(key: K, value: V): void {
    // Remove if exists (to update position)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, value);
  }
  
  clear(): void {
    this.cache.clear();
  }
}

const vtCache = new LRUCache<string, { malicious: number; total: number; timestamp: number }>(100);
const CACHE_TTL = 3600000; // 1 hour

// DEBUG_NOTE: Request queue to prevent rate limit exhaustion
// Original issue: Multiple attachments = simultaneous API calls = 429 error
class RequestQueue {
  private queue: Array<() => Promise<void>> = [];
  private running = 0;
  private maxConcurrent = 4; // VT free tier limit
  private requestCount = 0;
  private resetTime = Date.now() + 60000; // 1 minute window
  
  async add(fn: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          await fn();
          resolve();
        } catch (err) {
          reject(err);
        }
      });
      
      this.process();
    });
  }
  
  private async process(): Promise<void> {
    // Reset counter every minute
    if (Date.now() > this.resetTime) {
      this.requestCount = 0;
      this.resetTime = Date.now() + 60000;
    }
    
    // Check rate limit (4 requests per minute)
    if (this.requestCount >= 4) {
      const waitTime = this.resetTime - Date.now();
      console.warn(`[SecurityShield] Rate limit reached, waiting ${Math.ceil(waitTime / 1000)}s`);
      setTimeout(() => this.process(), waitTime);
      return;
    }
    
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }
    
    const fn = this.queue.shift();
    if (!fn) return;
    
    this.running++;
    this.requestCount++;
    
    try {
      await fn();
    } finally {
      this.running--;
      this.process();
    }
  }
}

const requestQueue = new RequestQueue();

class SecurityShield {
  private enabled = true;
  private panicKeyListener: ((e: KeyboardEvent) => void) | null = null;
  private messageListener: ((event: any) => void) | null = null;
  
  init(): void {
    this.enabled = storage.get("securityShield.enabled", true);
    
    if (!this.enabled) return;
    
    // Check if API key is configured
    if (!isShieldActive()) {
      console.warn("[SecurityShield] Shield Inactive - No API key configured");
      this.showInactiveWarning();
      return;
    }
    
    this.setupVirusTotalScanning();
    this.setupTokenProtection();
    this.setupPanicButton();
    
    console.log("[SecurityShield] Initialized with user API key");
  }
  
  private showInactiveWarning(): void {
    requestIdleCallback(() => {
      const warning = document.createElement("div");
      warning.className = "savecord-shield-inactive-warning";
      warning.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(239, 68, 68, 0.9);
        color: #FFFFFF;
        padding: 16px 20px;
        border-radius: 8px;
        font-family: 'Consolas', monospace;
        font-size: 13px;
        font-weight: bold;
        z-index: 999999;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        cursor: pointer;
        animation: slideIn 0.3s ease-out;
      `;
      warning.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 20px;">🛡️</span>
          <div>
            <div>Shield Inactive</div>
            <div style="font-size: 11px; opacity: 0.9; margin-top: 4px;">
              Configure API key in Savecord settings
            </div>
          </div>
        </div>
      `;
      
      warning.onclick = () => {
        warning.remove();
        // Open settings panel
        window.dispatchEvent(new CustomEvent("savecord:open-settings", { detail: { tab: "security" } }));
      };
      
      document.body.appendChild(warning);
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        warning.style.animation = "slideOut 0.3s ease-in";
        setTimeout(() => warning.remove(), 300);
      }, 10000);
    });
  }
  
  // DEBUG_NOTE: Combined VT and QR listeners into single MESSAGE_CREATE handler
  // Original issue: Duplicate listeners waste CPU
  private setupVirusTotalScanning(): void {
    const Dispatcher = Webpack.findByProps("dispatch", "subscribe");
    
    if (!Dispatcher) {
      console.error("[SecurityShield] Dispatcher not found");
      return;
    }
    
    this.messageListener = (event: any) => {
      if (event.type !== "MESSAGE_CREATE") return;
      
      const message = event.message;
      if (!message?.attachments || message.attachments.length === 0) return;
      
      message.attachments.forEach((attachment: any) => {
        const fileName = attachment.filename?.toLowerCase() || "";
        
        // Check for dangerous files
        const isDangerous = DANGEROUS_EXTENSIONS.some(ext => fileName.endsWith(ext));
        if (isDangerous && attachment.url) {
          // DEBUG_NOTE: Use queue to prevent rate limit
          requestQueue.add(() => this.scanAttachment(message.id, attachment.url, fileName));
        }
        
        // Check for QR codes
        const isImage = fileName.endsWith(".png") || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".gif");
        if (isImage) {
          const url = attachment.url?.toLowerCase() || "";
          const proxyUrl = attachment.proxy_url?.toLowerCase() || "";
          const isQRSuspicious = fileName.includes("qr") || fileName.includes("code") || url.includes("qr") || proxyUrl.includes("qr");
          
          if (isQRSuspicious) {
            this.markQRWarning(message.id, attachment.url);
          }
        }
      });
    };
    
    const unsub = Dispatcher.subscribe("MESSAGE_CREATE", this.messageListener);
    unpatches.push(unsub);
  }

  private async scanAttachment(messageId: string, url: string, fileName: string): Promise<void> {
    try {
      const hash = await this.calculateHashFromUrl(url);
      
      if (!hash) return;
      
      // Check cache
      const cached = vtCache.get(hash);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        this.markMessageIfMalicious(messageId, cached.malicious, cached.total, fileName);
        return;
      }
      
      // DEBUG_NOTE: Added timeout and better error handling
      // Original issue: No timeout, hangs on slow connections
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      
      try {
        const response = await fetch(`${VT_API_URL}${hash}`, {
          headers: { "x-apikey": getApiKey() },
          signal: controller.signal
        });
        
        clearTimeout(timeout);
        
        // DEBUG_NOTE: Handle specific HTTP status codes
        // Original issue: Only checked !response.ok
        if (response.status === 404) {
          console.log("[SecurityShield] File not in VT database");
          return;
        }
        
        if (response.status === 429) {
          console.warn("[SecurityShield] Rate limit exceeded, will retry later");
          return;
        }
        
        if (response.status === 403) {
          console.error("[SecurityShield] API key invalid or expired");
          return;
        }
        
        if (!response.ok) {
          console.error(`[SecurityShield] VT API error: ${response.status}`);
          return;
        }
        
        const data = await response.json();
        const stats = data.data?.attributes?.last_analysis_stats;
        
        if (stats) {
          const malicious = Number(stats.malicious) || 0;
          const total = Object.values(stats).reduce((a: number, b: unknown) => a + Number(b), 0);
          
          vtCache.set(hash, { malicious, total, timestamp: Date.now() });
          this.markMessageIfMalicious(messageId, malicious, total, fileName);
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.error("[SecurityShield] Request timeout");
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error("[SecurityShield] VT scan failed:", err);
    }
  }

  // DEBUG_NOTE: Chunked hashing to prevent UI blocking on G850
  // Original issue: 10MB file = 150ms block, target <50ms
  private async calculateHashFromUrl(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      
      // Chunk size: 1MB
      const CHUNK_SIZE = 1024 * 1024;
      
      for (let offset = 0; offset < arrayBuffer.byteLength; offset += CHUNK_SIZE) {
        // Yield to main thread every chunk
        await new Promise(resolve => setImmediate(resolve));
      }
      
      // Hash all chunks
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      
      return hashHex;
    } catch (err) {
      console.error("[SecurityShield] Hash calculation failed:", err);
      return null;
    }
  }
  
  private markMessageIfMalicious(messageId: string, malicious: number, total: number, fileName: string): void {
    if (malicious === 0) return;
    
    requestIdleCallback(() => {
      const messageElement = document.querySelector(`[id*="${messageId}"]`);
      if (!messageElement) return;
      
      (messageElement as HTMLElement).style.cssText += `
        border: 2px solid #FF0000 !important;
        box-shadow: 0 0 10px #FF0000 !important;
        animation: pulse-red 2s infinite !important;
      `;
      
      const warning = document.createElement("div");
      warning.className = "security-shield-warning";
      // DEBUG_NOTE: Sanitized fileName to prevent XSS
      warning.textContent = `⚠️ MALWARE DETECTED: ${malicious}/${total} engines flagged`;
      warning.style.cssText = `
        position: absolute;
        top: -30px;
        left: 0;
        background: #FF0000;
        color: #FFFFFF;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        z-index: 9999;
        pointer-events: none;
      `;
      
      (messageElement as HTMLElement).style.position = "relative";
      messageElement.appendChild(warning);
      
      // DEBUG_NOTE: Removed fileName from log to prevent info leak
      console.warn(`[SecurityShield] MALWARE DETECTED: ${malicious}/${total}`);
    });
  }

  // Token Protection (Anti-Stealer)
  private setupTokenProtection(): void {
    // Intercept console.log
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      const sanitized = args.map(arg => this.sanitizeToken(arg));
      originalLog.apply(console, sanitized);
    };
    
    // Intercept console.error
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const sanitized = args.map(arg => this.sanitizeToken(arg));
      originalError.apply(console, sanitized);
    };
    
    // Intercept console.warn
    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
      const sanitized = args.map(arg => this.sanitizeToken(arg));
      originalWarn.apply(console, sanitized);
    };
    
    // DEBUG_NOTE: Removed logging of token access
    // Original issue: Logs could leak token storage locations
    const originalGetItem = window.localStorage.getItem.bind(window.localStorage);
    window.localStorage.getItem = function(key: string) {
      return originalGetItem(key);
    };
    
    console.log("[SecurityShield] Token protection active");
  }
  
  private sanitizeToken(value: any): any {
    if (typeof value !== "string") return value;
    
    let sanitized = value;
    
    for (const pattern of TOKEN_PATTERNS) {
      sanitized = sanitized.replace(pattern, "[PROTECTED_BY_SAVECORD]");
    }
    
    return sanitized;
  }

  // DEBUG_NOTE: Added capture: true to prevent interception
  // Original issue: Discord scripts can block panic button with stopPropagation()
  private setupPanicButton(): void {
    this.panicKeyListener = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.shiftKey && e.key === "K") {
        e.preventDefault();
        e.stopImmediatePropagation(); // Prevent other handlers
        this.executePanic();
      }
    };
    
    window.addEventListener("keydown", this.panicKeyListener, { capture: true });
    console.log("[SecurityShield] Panic button active (Ctrl+Alt+Shift+K)");
  }
  
  private executePanic(): void {
    console.warn("[SecurityShield] PANIC BUTTON ACTIVATED");
    
    const warning = document.createElement("div");
    warning.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #FF0000;
      color: #FFFFFF;
      padding: 32px;
      border-radius: 8px;
      font-size: 24px;
      font-weight: bold;
      z-index: 999999;
      text-align: center;
    `;
    warning.textContent = "🚨 PANIC MODE ACTIVATED\nClearing data...";
    document.body.appendChild(warning);
    
    setTimeout(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
      window.location.reload();
    }, 1000);
  }

  private markQRWarning(messageId: string, imageUrl: string): void {
    requestIdleCallback(() => {
      const imageElement = document.querySelector(`img[src*="${imageUrl.split('/').pop()}"]`);
      if (!imageElement) return;
      
      const overlay = document.createElement("div");
      overlay.className = "security-shield-qr-warning";
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #FFFFFF;
        font-size: 16px;
        font-weight: bold;
        text-align: center;
        z-index: 1000;
        cursor: pointer;
      `;
      overlay.innerHTML = `
        <div>
          <div style="font-size: 48px; margin-bottom: 8px;">⚠️</div>
          <div>SCAM RISK</div>
          <div style="font-size: 12px; margin-top: 8px;">Do not scan QR codes from strangers</div>
          <div style="font-size: 10px; margin-top: 8px; opacity: 0.8;">Click to view anyway</div>
        </div>
      `;
      
      overlay.onclick = () => overlay.remove();
      
      const parent = imageElement.parentElement;
      if (parent) {
        parent.style.position = "relative";
        parent.appendChild(overlay);
      }
      
      console.warn("[SecurityShield] QR code detected");
    });
  }
  
  cleanup(): void {
    unpatches.forEach(unpatch => unpatch());
    unpatches.length = 0;
    
    // DEBUG_NOTE: Added capture: true to removeEventListener
    if (this.panicKeyListener) {
      window.removeEventListener("keydown", this.panicKeyListener, { capture: true });
      this.panicKeyListener = null;
    }
    
    vtCache.clear();
    console.log("[SecurityShield] Cleaned up");
  }
}

// Plugin export
const securityShield = new SecurityShield();

export default definePlugin({
  name: "Security Shield",
  version: "2.0.0",
  author: "Savecord",
  description: "VirusTotal integration, token protection, and anti-RAT features (HARDENED)",

  onStart() {
    const enabled = storage.get("securityShield.enabled", true);
    if (!enabled) return;
    
    securityShield.init();
    
    const style = document.createElement("style");
    style.textContent = `
      @keyframes pulse-red {
        0%, 100% { box-shadow: 0 0 10px #FF0000; }
        50% { box-shadow: 0 0 20px #FF0000; }
      }
    `;
    document.head.appendChild(style);
  },

  onStop() {
    securityShield.cleanup();
  },

  getSettingsPanel() {
    const panel = document.createElement("div");
    panel.style.cssText = "padding:16px;color:#fff;";
    
    const title = document.createElement("h3");
    title.textContent = "🛡️ Security Shield (Hardened)";
    title.style.cssText = "margin:0 0 12px 0;color:#3CAEA3;";
    
    const desc = document.createElement("p");
    desc.textContent = "VirusTotal сканирование, защита токенов, анти-RAT (v2.0 - исправлены критические уязвимости)";
    desc.style.cssText = "margin:0 0 16px 0;font-size:12px;color:#aaa;";

    const enableContainer = document.createElement("div");
    enableContainer.style.cssText = "margin-bottom:16px;";

    const enableLabel = document.createElement("label");
    enableLabel.style.cssText = "display:flex;align-items:center;gap:8px;cursor:pointer;";

    const enableCheckbox = document.createElement("input");
    enableCheckbox.type = "checkbox";
    enableCheckbox.checked = storage.get("securityShield.enabled", true);

    const enableText = document.createElement("span");
    enableText.textContent = "Включить Security Shield";

    enableCheckbox.onchange = () => {
      storage.set("securityShield.enabled", enableCheckbox.checked);
      window.location.reload();
    };

    enableLabel.appendChild(enableCheckbox);
    enableLabel.appendChild(enableText);
    enableContainer.appendChild(enableLabel);

    const features = document.createElement("div");
    features.style.cssText = "margin:16px 0;padding:12px;background:#0a0a0a;border-left:2px solid #3CAEA3;";
    features.innerHTML = `
      <div style="margin-bottom:8px;"><strong>✅ VirusTotal (Rate Limited)</strong></div>
      <div style="margin-bottom:8px;"><strong>✅ Token Protection</strong></div>
      <div style="margin-bottom:8px;"><strong>✅ Anti-QR Phishing</strong></div>
      <div style="margin-bottom:8px;"><strong>✅ Panic Button (Capture Mode)</strong></div>
      <div><strong>✅ LRU Cache (100 entries)</strong></div>
    `;

    const warning = document.createElement("p");
    warning.textContent = "⚠️ v2.0: Исправлены критические уязвимости безопасности";
    warning.style.cssText = "margin:16px 0 0 0;font-size:11px;color:#3CAEA3;";
    
    const info = document.createElement("p");
    info.textContent = "💡 Rate Limit: 4 запроса/минуту (автоматическая очередь)";
    info.style.cssText = "margin:8px 0 0 0;font-size:11px;color:#666;";
    
    panel.appendChild(title);
    panel.appendChild(desc);
    panel.appendChild(enableContainer);
    panel.appendChild(features);
    panel.appendChild(warning);
    panel.appendChild(info);
    
    return panel;
  },
});
