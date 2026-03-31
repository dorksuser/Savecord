import { definePlugin } from "../../types/plugin";
import { Storage } from "../storage";

const storage = new Storage();

function createRefreshButton() {
  const toolbar = document.querySelector('[class*="toolbar"]');
  if (!toolbar) return setTimeout(() => createRefreshButton(), 1000);

  const button = document.createElement("button");
  button.id = "savecord-zapret-refresh";
  button.textContent = "🔄 Refresh Connection";
  button.style.cssText = `
    padding: 6px 12px;
    background: #3CAEA3;
    color: #000;
    border: none;
    cursor: pointer;
    font-size: 12px;
    font-weight: bold;
    margin-right: 12px;
  `;

  button.onclick = async () => {
    button.textContent = "⏳ Restarting...";
    button.disabled = true;

    try {
      // Signal to loader to restart Zapret
      const event = new CustomEvent("savecord:zapret:restart");
      window.dispatchEvent(event);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      button.textContent = "✅ Restarted";
      setTimeout(() => {
        button.textContent = "🔄 Refresh Connection";
        button.disabled = false;
      }, 2000);
    } catch (err) {
      console.error("[Zapret Refresh] Error:", err);
      button.textContent = "❌ Failed";
      setTimeout(() => {
        button.textContent = "🔄 Refresh Connection";
        button.disabled = false;
      }, 2000);
    }
  };

  toolbar.prepend(button);
}

export default definePlugin({
  name: "Zapret Refresh",
  version: "1.0.0",
  author: "Savecord",
  description: "One-click Zapret connection refresh",

  onStart() {
    requestIdleCallback(() => {
      createRefreshButton();
    });

    // Listen for restart events from loader
    window.addEventListener("savecord:zapret:restarted", () => {
      console.log("[Zapret Refresh] Connection restarted successfully");
    });
  },

  onStop() {
    const button = document.getElementById("savecord-zapret-refresh");
    if (button) {
      button.remove();
    }
  },

  getSettingsPanel() {
    const panel = document.createElement("div");
    panel.style.cssText = "padding:16px;color:#fff;";
    
    const title = document.createElement("h3");
    title.textContent = "🔄 Zapret Refresh";
    title.style.cssText = "margin:0 0 12px 0;";
    
    const desc = document.createElement("p");
    desc.textContent = "Быстрый перезапуск Zapret для исправления проблем с подключением";
    desc.style.cssText = "margin:0 0 16px 0;font-size:12px;color:#aaa;";

    const info = document.createElement("p");
    info.textContent = "Кнопка добавлена в верхнюю панель Discord";
    info.style.cssText = "margin:0;font-size:12px;color:#3CAEA3;";
    
    panel.appendChild(title);
    panel.appendChild(desc);
    panel.appendChild(info);
    
    return panel;
  },
});
