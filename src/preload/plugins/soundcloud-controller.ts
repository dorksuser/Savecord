import { definePlugin } from "../../types/plugin";
import { Storage } from "../storage";
import { throttle, Disposable } from "../../utils/performance";

const storage = new Storage();
let ws: WebSocket | null = null;
let currentTrack = { title: "No track", artist: "Unknown" };
const disposables = new Disposable();
let isOptimized = false;
let updateThrottle = 500; // Default 500ms

function connectWebSocket() {
  try {
    ws = new WebSocket("ws://localhost:6463");

    ws.onmessage = throttle((event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        currentTrack = {
          title: data.track || "Unknown Track",
          artist: data.artist || "Unknown Artist",
        };
        updateUI();
      } catch (err) {
        // Silent fail
      }
    }, updateThrottle); // Use dynamic throttle

    ws.onerror = () => {
      // Silent fail
    };

    ws.onclose = () => {
      ws = null;
      setTimeout(() => connectWebSocket(), 5000);
    };
  } catch (err) {
    setTimeout(() => connectWebSocket(), 5000);
  }
}

function sendCommand(command: string) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ command }));
  }
}

function updateUI() {
  const trackTitle = document.getElementById("savecord-sc-track");
  if (trackTitle) {
    trackTitle.textContent = `${currentTrack.title} - ${currentTrack.artist}`;
  }
}

function createController() {
  const userArea = document.querySelector('[class*="panels"]');
  if (!userArea) return setTimeout(() => createController(), 1000);

  const container = document.createElement("div");
  container.id = "savecord-sc-controller";
  container.style.cssText = `
    padding: 8px 12px;
    background: #000000;
    border-top: 2px solid #3CAEA3;
    display: flex;
    align-items: center;
    gap: 12px;
    content-visibility: auto;
    contain: layout style paint;
  `;

  disposables.add(() => container.remove());

  const trackInfo = document.createElement("div");
  trackInfo.style.cssText = "flex: 1;";

  const trackTitle = document.createElement("p");
  trackTitle.id = "savecord-sc-track";
  trackTitle.textContent = `${currentTrack.title} - ${currentTrack.artist}`;
  trackTitle.style.cssText = "margin:0;font-size:12px;color:#3CAEA3;font-weight:bold;";

  trackInfo.appendChild(trackTitle);

  const playPauseBtn = document.createElement("button");
  playPauseBtn.textContent = "⏯️";
  playPauseBtn.style.cssText = `
    padding: 8px 16px;
    background: #3CAEA3;
    color: #000;
    border: none;
    cursor: pointer;
    font-size: 16px;
  `;
  playPauseBtn.onclick = () => sendCommand("toggle");

  const skipBtn = document.createElement("button");
  skipBtn.textContent = "⏭️";
  skipBtn.style.cssText = `
    padding: 8px 16px;
    background: #3CAEA3;
    color: #000;
    border: none;
    cursor: pointer;
    font-size: 16px;
  `;
  skipBtn.onclick = () => sendCommand("skip");

  container.appendChild(trackInfo);
  container.appendChild(playPauseBtn);
  container.appendChild(skipBtn);

  userArea.prepend(container);
}

export default definePlugin({
  name: "SoundCloud Controller",
  version: "1.0.0",
  author: "Savecord",
  description: "Native SoundCloud controls in Discord UI",

  onStart() {
    // Listen for optimization events
    const handleOptimizeOn = () => {
      isOptimized = true;
      updateThrottle = 10000; // 10s in optimized mode
    };
    
    const handleOptimizeOff = () => {
      isOptimized = false;
      updateThrottle = 500; // 500ms in normal mode
    };
    
    window.addEventListener("HYPE_OPTIMIZE_ON", handleOptimizeOn);
    window.addEventListener("HYPE_OPTIMIZE_OFF", handleOptimizeOff);
    
    disposables.add(() => window.removeEventListener("HYPE_OPTIMIZE_ON", handleOptimizeOn));
    disposables.add(() => window.removeEventListener("HYPE_OPTIMIZE_OFF", handleOptimizeOff));
    
    if (!storage.get("soundcloudController.enabled", false)) return;

    connectWebSocket();
    requestIdleCallback(() => {
      createController();
    });
  },

  onStop() {
    if (ws) {
      ws.close();
      ws = null;
    }

    disposables.dispose();
  },

  getSettingsPanel() {
    const panel = document.createElement("div");
    panel.style.cssText = "padding:16px;color:#fff;";
    
    const title = document.createElement("h3");
    title.textContent = "🎵 SoundCloud Controller";
    title.style.cssText = "margin:0 0 12px 0;";
    
    const desc = document.createElement("p");
    desc.textContent = "Управление SoundCloud прямо из Discord";
    desc.style.cssText = "margin:0 0 16px 0;font-size:12px;color:#aaa;";

    const toggle = document.createElement("button");
    toggle.textContent = storage.get("soundcloudController.enabled") ? "Отключить" : "Включить";
    toggle.style.cssText = "padding:8px 16px;background:#3CAEA3;color:#000;border:none;cursor:pointer;font-weight:bold;";
    
    toggle.onclick = () => {
      const current = storage.get("soundcloudController.enabled", false);
      storage.set("soundcloudController.enabled", !current);
      toggle.textContent = !current ? "Отключить" : "Включить";
      
      if (!current) {
        connectWebSocket();
        createController();
      } else {
        if (ws) ws.close();
        disposables.dispose();
      }
    };

    const info = document.createElement("p");
    info.textContent = "Требуется WebSocket сервер на порту 6463";
    info.style.cssText = "margin:16px 0 0 0;font-size:11px;color:#666;";
    
    panel.appendChild(title);
    panel.appendChild(desc);
    panel.appendChild(toggle);
    panel.appendChild(info);
    
    return panel;
  },
});
