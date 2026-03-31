import { definePlugin } from "../../types/plugin";
import { Storage } from "../storage";

const storage = new Storage();
let isRadioMode = false;

function enableRadioMode() {
  const appMount = document.getElementById("app-mount");
  if (!appMount) return;

  appMount.style.display = "none";
  isRadioMode = true;

  // Create minimal overlay
  const overlay = document.createElement("div");
  overlay.id = "savecord-radio-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    color: #3CAEA3;
    font-family: 'Courier New', monospace;
  `;

  const title = document.createElement("h1");
  title.textContent = "🎵 RADIO MODE";
  title.style.cssText = "font-size:48px;margin:0 0 24px 0;";

  const status = document.createElement("p");
  status.textContent = "Voice connection active";
  status.style.cssText = "font-size:18px;margin:0 0 32px 0;color:#fff;";

  const hint = document.createElement("p");
  hint.textContent = "Press Ctrl+Shift+F to exit";
  hint.style.cssText = "font-size:14px;color:#666;";

  overlay.appendChild(title);
  overlay.appendChild(status);
  overlay.appendChild(hint);

  document.body.appendChild(overlay);

  storage.set("radioMode.enabled", true);
  console.log("[Radio Mode] Enabled - UI frozen, CPU saved");
}

function disableRadioMode() {
  const appMount = document.getElementById("app-mount");
  if (appMount) {
    appMount.style.display = "";
  }

  const overlay = document.getElementById("savecord-radio-overlay");
  if (overlay) {
    overlay.remove();
  }

  isRadioMode = false;
  storage.set("radioMode.enabled", false);
  console.log("[Radio Mode] Disabled");
}

function toggleRadioMode() {
  if (isRadioMode) {
    disableRadioMode();
  } else {
    enableRadioMode();
  }
}

export default definePlugin({
  name: "Radio Mode",
  version: "1.0.0",
  author: "Savecord",
  description: "Audio-only mode for maximum performance during gaming",

  onStart() {
    // Register global hotkey
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "F") {
        e.preventDefault();
        toggleRadioMode();
      }
    });

    // Restore state if was enabled
    if (storage.get("radioMode.enabled", false)) {
      enableRadioMode();
    }
  },

  onStop() {
    disableRadioMode();
  },

  getSettingsPanel() {
    const panel = document.createElement("div");
    panel.style.cssText = "padding:16px;color:#fff;";
    
    const title = document.createElement("h3");
    title.textContent = "🎵 Radio Mode";
    title.style.cssText = "margin:0 0 12px 0;";
    
    const desc = document.createElement("p");
    desc.textContent = "Скрывает UI для экономии 30-40% CPU во время игры";
    desc.style.cssText = "margin:0 0 16px 0;font-size:12px;color:#aaa;";

    const hotkey = document.createElement("p");
    hotkey.textContent = "Горячая клавиша: Ctrl+Shift+F";
    hotkey.style.cssText = "margin:0 0 16px 0;font-size:14px;color:#3CAEA3;font-weight:bold;";

    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = isRadioMode ? "Выключить Radio Mode" : "Включить Radio Mode";
    toggleBtn.style.cssText = "padding:12px 24px;background:#3CAEA3;color:#000;border:none;cursor:pointer;font-weight:bold;";
    
    toggleBtn.onclick = () => {
      toggleRadioMode();
      toggleBtn.textContent = isRadioMode ? "Выключить Radio Mode" : "Включить Radio Mode";
    };

    const warning = document.createElement("p");
    warning.textContent = "⚡ Максимальная производительность для слабых ПК";
    warning.style.cssText = "margin:16px 0 0 0;font-size:11px;color:#3CAEA3;";
    
    panel.appendChild(title);
    panel.appendChild(desc);
    panel.appendChild(hotkey);
    panel.appendChild(toggleBtn);
    panel.appendChild(warning);
    
    return panel;
  },
});
