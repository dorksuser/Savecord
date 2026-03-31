import { definePlugin } from "../../types/plugin";

let ws: WebSocket | null = null;

function startWebSocketServer() {
  try {
    ws = new WebSocket("ws://localhost:6463");

    ws.onopen = () => {
      console.log("[SoundCloud RPC] Connected to WebSocket server");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        updatePresence(data);
      } catch (err) {
        console.error("[SoundCloud RPC] Invalid message:", err);
      }
    };

    ws.onerror = () => {
      console.log("[SoundCloud RPC] Connection failed, retrying in 5s...");
    };

    ws.onclose = () => {
      ws = null;
      setTimeout(() => startWebSocketServer(), 5000);
    };
  } catch (err) {
    console.error("[SoundCloud RPC] Error:", err);
    setTimeout(() => startWebSocketServer(), 5000);
  }
}

function updatePresence(data: any) {
  requestIdleCallback(() => {
    const DiscordNative = (window as any).DiscordNative;
    if (!DiscordNative?.rpc) return;

    DiscordNative.rpc.setActivity({
      details: data.track || "Unknown Track",
      state: data.artist || "Unknown Artist",
      largeImageKey: "soundcloud",
      largeImageText: "SoundCloud",
      buttons: data.url ? [{ label: "Listen", url: data.url }] : [],
      timestamps: data.startTime ? { start: data.startTime } : undefined,
    });
  });
}

export default definePlugin({
  name: "SoundCloud RPC",
  version: "1.0.0",
  author: "Savecord",
  description: "Display SoundCloud listening activity via Discord Rich Presence",

  onStart() {
    startWebSocketServer();
  },

  onStop() {
    if (ws) {
      ws.close();
      ws = null;
    }
  },

  getSettingsPanel() {
    const panel = document.createElement("div");
    panel.style.cssText = "padding:16px;color:#fff;";
    
    const title = document.createElement("h3");
    title.textContent = "SoundCloud RPC";
    title.style.cssText = "margin:0 0 12px 0;";
    
    const desc = document.createElement("p");
    desc.textContent = "Connects to ws://localhost:6463 to receive SoundCloud track data.";
    desc.style.cssText = "margin:0;font-size:12px;color:#aaa;";
    
    panel.appendChild(title);
    panel.appendChild(desc);
    
    return panel;
  },
});
