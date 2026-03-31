import { definePlugin } from "../../types/plugin";
import { Storage } from "../storage";
import { Webpack } from "../../webpack";
import { Patcher } from "../../webpack/patcher";

const storage = new Storage();
const unpatches: Array<() => void> = [];

// Simple EXIF stripper for JPEG files
function stripExifFromJpeg(arrayBuffer: ArrayBuffer): ArrayBuffer {
  const view = new DataView(arrayBuffer);
  
  // Check if it's a valid JPEG (starts with FFD8)
  if (view.getUint16(0) !== 0xFFD8) {
    return arrayBuffer; // Not a JPEG, return as-is
  }
  
  let offset = 2;
  const newData: number[] = [0xFF, 0xD8]; // Start with JPEG marker
  
  while (offset < view.byteLength) {
    // Check for marker
    if (view.getUint8(offset) !== 0xFF) break;
    
    const marker = view.getUint8(offset + 1);
    
    // Skip EXIF data (APP1 marker = 0xE1)
    if (marker === 0xE1) {
      const segmentLength = view.getUint16(offset + 2);
      offset += segmentLength + 2;
      continue;
    }
    
    // Skip other APP markers (0xE0-0xEF) except APP0
    if (marker >= 0xE0 && marker <= 0xEF && marker !== 0xE0) {
      const segmentLength = view.getUint16(offset + 2);
      offset += segmentLength + 2;
      continue;
    }
    
    // Start of Scan (SOS) - copy rest of file
    if (marker === 0xDA) {
      // Copy remaining data
      for (let i = offset; i < view.byteLength; i++) {
        newData.push(view.getUint8(i));
      }
      break;
    }
    
    // Copy this segment
    const segmentLength = view.getUint16(offset + 2);
    for (let i = 0; i < segmentLength + 2; i++) {
      newData.push(view.getUint8(offset + i));
    }
    offset += segmentLength + 2;
  }
  
  return new Uint8Array(newData).buffer;
}

// Simple PNG metadata stripper
function stripMetadataFromPng(arrayBuffer: ArrayBuffer): ArrayBuffer {
  const view = new DataView(arrayBuffer);
  
  // Check PNG signature
  if (view.getUint32(0) !== 0x89504E47 || view.getUint32(4) !== 0x0D0A1A0A) {
    return arrayBuffer; // Not a PNG
  }
  
  const newData: number[] = [];
  
  // Copy PNG signature
  for (let i = 0; i < 8; i++) {
    newData.push(view.getUint8(i));
  }
  
  let offset = 8;
  
  while (offset < view.byteLength) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(
      view.getUint8(offset + 4),
      view.getUint8(offset + 5),
      view.getUint8(offset + 6),
      view.getUint8(offset + 7)
    );
    
    // Skip metadata chunks (tEXt, zTXt, iTXt, tIME, pHYs, etc.)
    const skipChunks = ['tEXt', 'zTXt', 'iTXt', 'tIME', 'pHYs', 'sPLT', 'iCCP', 'sRGB', 'gAMA', 'cHRM'];
    
    if (!skipChunks.includes(type)) {
      // Copy this chunk
      for (let i = 0; i < length + 12; i++) {
        newData.push(view.getUint8(offset + i));
      }
    }
    
    offset += length + 12; // length + type + data + CRC
    
    // Stop at IEND
    if (type === 'IEND') break;
  }
  
  return new Uint8Array(newData).buffer;
}

function patchFileUpload() {
  // Find Discord's upload module
  const UploadModule = Webpack.findByProps("upload", "instantBatchUpload");
  
  if (!UploadModule || !UploadModule.upload) {
    console.error("[OnionPrivacy] Upload module not found");
    return;
  }
  
  const unpatch = Patcher.before(UploadModule, "upload", async (args) => {
    const [channelId, file, ...rest] = args;
    
    if (!file || !file.file) return args;
    
    const fileName = file.file.name?.toLowerCase() || "";
    
    // Only process images
    if (!fileName.endsWith(".jpg") && !fileName.endsWith(".jpeg") && !fileName.endsWith(".png")) {
      return args;
    }
    
    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.file.arrayBuffer();
      
      let cleanedBuffer: ArrayBuffer;
      
      if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
        cleanedBuffer = stripExifFromJpeg(arrayBuffer);
        console.log("[OnionPrivacy] Stripped EXIF from JPEG");
      } else if (fileName.endsWith(".png")) {
        cleanedBuffer = stripMetadataFromPng(arrayBuffer);
        console.log("[OnionPrivacy] Stripped metadata from PNG");
      } else {
        return args;
      }
      
      // Create new File object with cleaned data
      const cleanedFile = new File([cleanedBuffer], file.file.name, {
        type: file.file.type,
        lastModified: Date.now() // Remove original timestamp
      });
      
      // Replace file in args
      file.file = cleanedFile;
      
      return [channelId, file, ...rest];
    } catch (err) {
      console.error("[OnionPrivacy] Failed to strip metadata:", err);
      return args;
    }
  });
  
  unpatches.push(unpatch);
}

function injectFingerprintSpoof() {
  // Inject fingerprint spoofing script
  const script = document.createElement("script");
  script.textContent = `
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
      
      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function(...args) {
        const ctx = this.getContext('2d');
        if (ctx) {
          const imageData = ctx.getImageData(0, 0, this.width, this.height);
          for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] = imageData.data[i] ^ 1;
          }
          ctx.putImageData(imageData, 0, 0);
        }
        return originalToDataURL.apply(this, args);
      };
      
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return 'Intel Inc.';
        if (parameter === 37446) return 'Intel HD Graphics';
        return getParameter.call(this, parameter);
      };
      
      console.log('[Savecord Privacy] Fingerprint spoofing active');
    })();
  `;
  
  document.documentElement.appendChild(script);
  script.remove();
}

export default definePlugin({
  name: "Onion Privacy",
  version: "1.0.0",
  author: "Savecord",
  description: "Onion-style privacy protection with telemetry blocking and fingerprint spoofing",

  onStart() {
    const enabled = storage.get("onionPrivacy.enabled", true);
    
    if (!enabled) return;
    
    // Inject fingerprint spoofing
    const spoofFingerprint = storage.get("onionPrivacy.spoofFingerprint", true);
    if (spoofFingerprint) {
      injectFingerprintSpoof();
    }
    
    // Patch file uploads for metadata sanitization
    const sanitizeMetadata = storage.get("onionPrivacy.sanitizeMetadata", true);
    if (sanitizeMetadata) {
      requestIdleCallback(() => {
        patchFileUpload();
      });
    }
  },

  onStop() {
    unpatches.forEach((unpatch) => unpatch());
    unpatches.length = 0;
  },

  getSettingsPanel() {
    const panel = document.createElement("div");
    panel.style.cssText = "padding:16px;color:#fff;";
    
    const title = document.createElement("h3");
    title.textContent = "🧅 Onion Privacy";
    title.style.cssText = "margin:0 0 12px 0;color:#3CAEA3;";
    
    const desc = document.createElement("p");
    desc.textContent = "Защита приватности: блокировка телеметрии, подмена отпечатков, очистка метаданных";
    desc.style.cssText = "margin:0 0 16px 0;font-size:12px;color:#aaa;";

    // Enable/Disable toggle
    const enableContainer = document.createElement("div");
    enableContainer.style.cssText = "margin-bottom:16px;";

    const enableLabel = document.createElement("label");
    enableLabel.style.cssText = "display:flex;align-items:center;gap:8px;cursor:pointer;";

    const enableCheckbox = document.createElement("input");
    enableCheckbox.type = "checkbox";
    enableCheckbox.checked = storage.get("onionPrivacy.enabled", true);

    const enableText = document.createElement("span");
    enableText.textContent = "Включить Onion Privacy";

    enableCheckbox.onchange = () => {
      storage.set("onionPrivacy.enabled", enableCheckbox.checked);
      window.location.reload();
    };

    enableLabel.appendChild(enableCheckbox);
    enableLabel.appendChild(enableText);
    enableContainer.appendChild(enableLabel);

    // Fingerprint spoofing toggle
    const fingerprintContainer = document.createElement("div");
    fingerprintContainer.style.cssText = "margin-bottom:16px;";

    const fingerprintLabel = document.createElement("label");
    fingerprintLabel.style.cssText = "display:flex;align-items:center;gap:8px;cursor:pointer;";

    const fingerprintCheckbox = document.createElement("input");
    fingerprintCheckbox.type = "checkbox";
    fingerprintCheckbox.checked = storage.get("onionPrivacy.spoofFingerprint", true);

    const fingerprintText = document.createElement("span");
    fingerprintText.textContent = "Подмена цифровых отпечатков";

    fingerprintCheckbox.onchange = () => {
      storage.set("onionPrivacy.spoofFingerprint", fingerprintCheckbox.checked);
      window.location.reload();
    };

    fingerprintLabel.appendChild(fingerprintCheckbox);
    fingerprintLabel.appendChild(fingerprintText);
    fingerprintContainer.appendChild(fingerprintLabel);

    // Metadata sanitization toggle
    const metadataContainer = document.createElement("div");
    metadataContainer.style.cssText = "margin-bottom:16px;";

    const metadataLabel = document.createElement("label");
    metadataLabel.style.cssText = "display:flex;align-items:center;gap:8px;cursor:pointer;";

    const metadataCheckbox = document.createElement("input");
    metadataCheckbox.type = "checkbox";
    metadataCheckbox.checked = storage.get("onionPrivacy.sanitizeMetadata", true);

    const metadataText = document.createElement("span");
    metadataText.textContent = "Очистка EXIF/метаданных из изображений";

    metadataCheckbox.onchange = () => {
      storage.set("onionPrivacy.sanitizeMetadata", metadataCheckbox.checked);
    };

    metadataLabel.appendChild(metadataCheckbox);
    metadataLabel.appendChild(metadataText);
    metadataContainer.appendChild(metadataLabel);

    const warning = document.createElement("p");
    warning.textContent = "⚠️ Блокировка телеметрии настраивается в main process";
    warning.style.cssText = "margin:16px 0 0 0;font-size:11px;color:#FF6B6B;";
    
    const info = document.createElement("p");
    info.textContent = "💡 Для использования Tor: настройте прокси 127.0.0.1:9050 в конфиге";
    info.style.cssText = "margin:8px 0 0 0;font-size:11px;color:#3CAEA3;";
    
    panel.appendChild(title);
    panel.appendChild(desc);
    panel.appendChild(enableContainer);
    panel.appendChild(fingerprintContainer);
    panel.appendChild(metadataContainer);
    panel.appendChild(warning);
    panel.appendChild(info);
    
    return panel;
  },
});
