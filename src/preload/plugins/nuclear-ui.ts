import { definePlugin } from "../../types/plugin";
import { Storage } from "../storage";

const storage = new Storage();

const NUCLEAR_CSS = `
  * { border-radius: 0 !important; backdrop-filter: none !important; }
  body, .theme-dark, [class*="bg-"], [class*="background"] { background: #000000 !important; }
  .sidebar, .chat, .members, .panels, [class*="container"] { background: #000000 !important; }
  .selected, .active, button:hover { background: #1E3A8A !important; }
  [class*="nitro"], [class*="sticker"], [class*="explore"], [class*="gift"] { display: none !important; }
  .avatar, [class*="avatar"] { border-radius: 0 !important; }
  [class*="status"] { display: none !important; }
  * { font-family: 'Courier New', monospace !important; font-size: 12px !important; }
  * { margin: 2px !important; padding: 2px !important; }
  * { animation: none !important; transition: none !important; box-shadow: none !important; }
  img, video, [class*="embed"] { 
    display: none !important; 
  }
  img::before, video::before {
    content: "Media Killswitch Active - Click to View";
    display: block;
    background: #2A2A2A;
    color: #fff;
    padding: 20px;
    text-align: center;
  }
`;

class NuclearUI {
  private styleElement: HTMLStyleElement | null = null;

  apply() {
    if (this.styleElement) return;

    // Remove default theme when Nuclear Mode is enabled
    const Savecord = (window as any).Savecord;
    if (Savecord?.removeDefaultTheme) {
      Savecord.removeDefaultTheme();
    }

    this.styleElement = document.createElement("style");
    this.styleElement.id = "savecord-nuclear";
    this.styleElement.textContent = NUCLEAR_CSS;
    document.head.appendChild(this.styleElement);
  }

  remove() {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }

    // Restore default theme when Nuclear Mode is disabled
    const Savecord = (window as any).Savecord;
    const storage = new Storage();
    const theme = storage.get("settings.theme", "savecord");
    
    if (theme === "savecord" && Savecord?.applyDefaultTheme) {
      Savecord.applyDefaultTheme();
    }
  }

  patchDispatcher() {
    requestIdleCallback(() => {
      const Dispatcher = (window as any).Dispatcher;
      if (!Dispatcher) return;

      const original = Dispatcher.dispatch;
      Dispatcher.dispatch = function (event: any) {
        if (event.type?.includes("TRACK") || event.type?.includes("ANALYTICS")) {
          return;
        }
        return original.apply(this, arguments);
      };
    });
  }
}

const nuclear = new NuclearUI();

export default definePlugin({
  name: "Nuclear UI",
  version: "1.0.0",
  author: "Savecord",
  description: "Extreme performance optimization with media blocking",

  onStart() {
    const enabled = storage.get("nuclear.enabled", false);
    if (enabled) {
      nuclear.apply();
      nuclear.patchDispatcher();
    }

    requestIdleCallback(() => {
      addToggle();
    });
  },

  onStop() {
    nuclear.remove();
  },

  getSettingsPanel() {
    const panel = document.createElement("div");
    panel.style.cssText = "padding:16px;color:#fff;";
    
    const title = document.createElement("h3");
    title.textContent = "Nuclear UI Settings";
    title.style.cssText = "margin:0 0 12px 0;";
    
    const desc = document.createElement("p");
    desc.textContent = "Extreme performance mode with media blocking and minimal styling.";
    desc.style.cssText = "margin:0 0 16px 0;font-size:12px;color:#aaa;";
    
    const toggle = document.createElement("button");
    toggle.textContent = storage.get("nuclear.enabled") ? "Disable" : "Enable";
    toggle.style.cssText = "padding:8px 16px;background:#1E3A8A;color:#fff;border:none;cursor:pointer;";
    
    toggle.onclick = () => {
      const current = storage.get("nuclear.enabled", false);
      storage.set("nuclear.enabled", !current);
      
      if (!current) {
        // Remove default theme before applying Nuclear
        const Savecord = (window as any).Savecord;
        if (Savecord?.removeDefaultTheme) {
          Savecord.removeDefaultTheme();
        }
        
        nuclear.apply();
        nuclear.patchDispatcher();
      } else {
        nuclear.remove();
        
        // Restore default theme after disabling Nuclear
        const theme = storage.get("settings.theme", "savecord");
        const Savecord = (window as any).Savecord;
        if (theme === "savecord" && Savecord?.applyDefaultTheme) {
          Savecord.applyDefaultTheme();
        }
      }
      
      toggle.textContent = !current ? "Disable" : "Enable";
    };
    
    panel.appendChild(title);
    panel.appendChild(desc);
    panel.appendChild(toggle);
    
    return panel;
  },

});

function addToggle() {
  const toolbar = document.querySelector('[class*="toolbar"]');
  if (!toolbar) return setTimeout(() => addToggle(), 1000);

  const container = document.createElement("div");
  container.style.cssText = "display:flex;align-items:center;gap:8px;padding:0 12px;cursor:pointer;user-select:none;";
  
  const label = document.createElement("span");
  label.textContent = "Nuclear:";
  label.style.cssText = "color:#fff;font-size:12px;";
  
  const status = document.createElement("span");
  status.id = "savecord-nuclear-status";
  status.textContent = storage.get("nuclear.enabled") ? "ON" : "OFF";
  status.style.cssText = `color:${storage.get("nuclear.enabled") ? "#3B82F6" : "#666"};font-weight:bold;font-size:12px;`;
  
  container.onclick = () => {
    const current = storage.get("nuclear.enabled", false);
    storage.set("nuclear.enabled", !current);
    
    if (!current) {
      // Remove default theme before applying Nuclear
      const Savecord = (window as any).Savecord;
      if (Savecord?.removeDefaultTheme) {
        Savecord.removeDefaultTheme();
      }
      
      nuclear.apply();
      nuclear.patchDispatcher();
    } else {
      nuclear.remove();
      
      // Restore default theme after disabling Nuclear
      const theme = storage.get("settings.theme", "savecord");
      const Savecord = (window as any).Savecord;
      if (theme === "savecord" && Savecord?.applyDefaultTheme) {
        Savecord.applyDefaultTheme();
      }
    }
    
    status.textContent = !current ? "ON" : "OFF";
    status.style.color = !current ? "#3B82F6" : "#666";
  };
  
  container.appendChild(label);
  container.appendChild(status);
  toolbar.prepend(container);
}
