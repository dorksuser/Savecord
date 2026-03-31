import { definePlugin } from "../../types/plugin";
import { Storage } from "../storage";
import { Disposable } from "../../utils/performance";
import { t, onLocaleChange } from "../i18n";

const storage = new Storage();
const disposables = new Disposable();
let quickBarElement: HTMLElement | null = null;
let localeUnsubscribe: (() => void) | null = null;

interface ButtonState {
  optimize: boolean;
  nuclear: boolean;
  ghost: boolean;
  radio: boolean;
}

const buttonStates: ButtonState = {
  optimize: false,
  nuclear: false,
  ghost: false,
  radio: false,
};

function updateButtonStates() {
  buttonStates.optimize = storage.get("master.optimize", false);
  buttonStates.nuclear = storage.get("nuclear.enabled", false);
  buttonStates.ghost = storage.get("ghostMode.typingStealth", false) || storage.get("ghostMode.readStealth", false);
  buttonStates.radio = storage.get("radioMode.enabled", false);
}

function createButton(icon: string, tooltipKey: string, isActive: boolean, onClick: () => void): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.textContent = icon;
  btn.title = t(tooltipKey);
  btn.style.cssText = `
    padding: 6px 8px;
    background: ${isActive ? "#3CAEA3" : "#000000"};
    color: ${isActive ? "#000000" : "#3CAEA3"};
    border: 1px solid #3CAEA3;
    cursor: pointer;
    font-size: 14px;
    margin: 0 2px;
    box-shadow: none;
    transition: none;
    outline: none;
  `;
  
  btn.onclick = onClick;
  
  btn.onmouseenter = () => {
    if (!isActive) {
      btn.style.background = "#1a1a1a";
    }
  };
  
  btn.onmouseleave = () => {
    btn.style.background = isActive ? "#3CAEA3" : "#000000";
  };
  
  return btn;
}

function updateButtonVisuals() {
  if (!quickBarElement) return;
  
  const buttons = quickBarElement.querySelectorAll("button");
  if (buttons.length !== 5) return;
  
  // Update tooltips
  buttons[0].title = t("quickbar.optimize");
  buttons[1].title = t("quickbar.nuclear");
  buttons[2].title = t("quickbar.zapret");
  buttons[3].title = t("quickbar.ghost");
  buttons[4].title = t("quickbar.radio");
  
  // Optimize button
  const optimizeBtn = buttons[0] as HTMLButtonElement;
  const isOptimize = buttonStates.optimize;
  optimizeBtn.style.background = isOptimize ? "#3CAEA3" : "#000000";
  optimizeBtn.style.color = isOptimize ? "#000000" : "#666666";
  
  // Nuclear button
  const nuclearBtn = buttons[1] as HTMLButtonElement;
  const isNuclear = buttonStates.nuclear;
  nuclearBtn.style.background = isNuclear ? "#3CAEA3" : "#000000";
  nuclearBtn.style.color = isNuclear ? "#000000" : "#3CAEA3";
  
  // Ghost button
  const ghostBtn = buttons[3] as HTMLButtonElement;
  const isGhost = buttonStates.ghost;
  ghostBtn.style.background = isGhost ? "#3CAEA3" : "#000000";
  ghostBtn.style.color = isGhost ? "#000000" : "#3CAEA3";
  
  // Radio button
  const radioBtn = buttons[4] as HTMLButtonElement;
  const isRadio = buttonStates.radio;
  radioBtn.style.background = isRadio ? "#3CAEA3" : "#000000";
  radioBtn.style.color = isRadio ? "#000000" : "#3CAEA3";
}

function toggleOptimization() {
  const current = storage.get("master.optimize", false);
  const newState = !current;
  storage.set("master.optimize", newState);
  
  if (newState) {
    // Enable optimization mode
    applyNuclearCSS();
    
    // Dispatch custom event for plugins
    const event = new CustomEvent("HYPE_OPTIMIZE_ON");
    window.dispatchEvent(event);
  } else {
    // Disable optimization mode
    removeNuclearCSS();
    
    // Restore default theme if needed
    const Savecord = (window as any).Savecord;
    const theme = storage.get("settings.theme", "savecord");
    if (theme === "savecord" && Savecord?.applyDefaultTheme) {
      Savecord.applyDefaultTheme();
    }
    
    // Dispatch custom event for plugins
    const event = new CustomEvent("HYPE_OPTIMIZE_OFF");
    window.dispatchEvent(event);
  }
  
  updateButtonStates();
  updateButtonVisuals();
}

function applyNuclearCSS() {
  // Remove existing nuclear style if any
  removeNuclearCSS();
  
  const nuclearStyle = document.createElement("style");
  nuclearStyle.id = "savecord-nuclear-optimization";
  nuclearStyle.textContent = `
    /* Nuclear Optimization CSS - Maximum Performance */
    * {
      animation: none !important;
      transition: none !important;
      box-shadow: none !important;
      backdrop-filter: none !important;
      filter: none !important;
      border-radius: 0 !important;
    }
    
    body, .theme-dark, [class*="bg-"], [class*="background"] {
      background: #000000 !important;
    }
    
    [class*="sidebar"], [class*="chat"], [class*="members"], [class*="panels"] {
      background: #000000 !important;
    }
    
    [class*="selected"], [class*="active"], button:hover {
      background: #1E3A8A !important;
    }
    
    * {
      will-change: auto !important;
    }
    
    [class*="scroller"] {
      content-visibility: auto;
      contain: layout style paint;
    }
  `;
  
  document.head.appendChild(nuclearStyle);
  
  // Remove default theme
  const Savecord = (window as any).Savecord;
  if (Savecord?.removeDefaultTheme) {
    Savecord.removeDefaultTheme();
  }
}

function removeNuclearCSS() {
  const nuclearStyle = document.getElementById("savecord-nuclear-optimization");
  if (nuclearStyle) {
    nuclearStyle.remove();
  }
}

function toggleNuclear() {
  const current = storage.get("nuclear.enabled", false);
  storage.set("nuclear.enabled", !current);
  
  const Savecord = (window as any).Savecord;
  if (!current) {
    if (Savecord?.removeDefaultTheme) Savecord.removeDefaultTheme();
    // Apply nuclear theme logic here
  } else {
    // Remove nuclear theme and restore default
    const theme = storage.get("settings.theme", "savecord");
    if (theme === "savecord" && Savecord?.applyDefaultTheme) {
      Savecord.applyDefaultTheme();
    }
  }
  
  updateButtonStates();
  updateButtonVisuals();
}

function refreshZapret() {
  const btn = quickBarElement?.querySelector("button:nth-child(3)") as HTMLButtonElement;
  if (btn) {
    btn.textContent = "⏳";
    btn.disabled = true;
  }
  
  // Signal to loader to restart Zapret
  const event = new CustomEvent("savecord:zapret:restart");
  window.dispatchEvent(event);
  
  setTimeout(() => {
    if (btn) {
      btn.textContent = "🔄";
      btn.disabled = false;
    }
  }, 2000);
}

function toggleGhost() {
  const typingStealth = storage.get("ghostMode.typingStealth", false);
  const readStealth = storage.get("ghostMode.readStealth", false);
  
  if (!typingStealth && !readStealth) {
    storage.set("ghostMode.typingStealth", true);
  } else {
    storage.set("ghostMode.typingStealth", false);
    storage.set("ghostMode.readStealth", false);
  }
  
  updateButtonStates();
  updateButtonVisuals();
}

function toggleRadio() {
  const current = storage.get("radioMode.enabled", false);
  storage.set("radioMode.enabled", !current);
  
  if (!current) {
    // Enable radio mode
    const appMount = document.getElementById("app-mount");
    if (appMount) appMount.style.display = "none";
    
    // Hide quick bar in radio mode
    if (quickBarElement) quickBarElement.style.display = "none";
  } else {
    // Disable radio mode
    const appMount = document.getElementById("app-mount");
    if (appMount) appMount.style.display = "";
    
    // Show quick bar
    if (quickBarElement) quickBarElement.style.display = "flex";
  }
  
  updateButtonStates();
  updateButtonVisuals();
}

function createQuickBar() {
  const toolbar = document.querySelector('[class*="toolbar"]');
  if (!toolbar) return setTimeout(() => createQuickBar(), 1000);
  
  if (quickBarElement) return;
  
  updateButtonStates();
  
  const container = document.createElement("div");
  container.id = "savecord-quickbar";
  container.style.cssText = `
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 8px;
    background: #000000;
    border: 1px solid #3CAEA3;
    margin-right: 8px;
    content-visibility: auto;
    contain: layout style paint;
  `;
  
  const optimizeBtn = createButton("⚡", "quickbar.optimize", buttonStates.optimize, toggleOptimization);
  const nuclearBtn = createButton("☢️", "quickbar.nuclear", buttonStates.nuclear, toggleNuclear);
  const zapretBtn = createButton("🔄", "quickbar.zapret", false, refreshZapret);
  const ghostBtn = createButton("👻", "quickbar.ghost", buttonStates.ghost, toggleGhost);
  const radioBtn = createButton("📻", "quickbar.radio", buttonStates.radio, toggleRadio);
  
  container.appendChild(optimizeBtn);
  container.appendChild(nuclearBtn);
  container.appendChild(zapretBtn);
  container.appendChild(ghostBtn);
  container.appendChild(radioBtn);
  
  toolbar.prepend(container);
  quickBarElement = container;
  
  // Hide if radio mode is active
  if (buttonStates.radio) {
    container.style.display = "none";
  }
  
  // Apply optimization if enabled
  if (buttonStates.optimize) {
    applyNuclearCSS();
  }
  
  disposables.add(() => container.remove());
}

export default definePlugin({
  name: "Quick Bar",
  version: "1.0.0",
  author: "Savecord",
  description: "Quick access toolbar for main features",

  onStart() {
    // Subscribe to locale changes
    localeUnsubscribe = onLocaleChange(() => {
      updateButtonVisuals();
    });
    
    requestIdleCallback(() => {
      createQuickBar();
    });
  },

  onStop() {
    if (localeUnsubscribe) {
      localeUnsubscribe();
      localeUnsubscribe = null;
    }
    
    disposables.dispose();
    quickBarElement = null;
  },

  getSettingsPanel() {
    const panel = document.createElement("div");
    panel.style.cssText = "padding:16px;color:#fff;";
    
    const title = document.createElement("h3");
    title.textContent = "⚡ Quick Bar";
    title.style.cssText = "margin:0 0 12px 0;";
    
    const desc = document.createElement("p");
    desc.textContent = "Панель быстрого доступа к основным функциям";
    desc.style.cssText = "margin:0;font-size:12px;color:#aaa;";
    
    panel.appendChild(title);
    panel.appendChild(desc);
    
    return panel;
  },
});