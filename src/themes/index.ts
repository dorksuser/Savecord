import { Storage } from "../preload/storage";

const storage = new Storage();

export class ThemeManager {
  private styleElement: HTMLStyleElement | null = null;
  private themes: Map<string, string> = new Map();

  constructor() {
    this.loadBuiltInThemes();
  }

  private loadBuiltInThemes() {
    this.themes.set("nuclear", `
      * { border-radius: 0 !important; backdrop-filter: none !important; }
      body, .theme-dark, [class*="bg-"], [class*="background"] { background: #000000 !important; }
      .sidebar, .chat, .members, .panels { background: #000000 !important; }
      .selected, .active, button:hover { background: #1E3A8A !important; }
      * { font-family: 'Courier New', monospace !important; }
      * { animation: none !important; transition: none !important; box-shadow: none !important; }
    `);

    this.themes.set("midnight", `
      :root {
        --background-primary: #0a0e27;
        --background-secondary: #0f1535;
        --background-tertiary: #141b3d;
        --text-normal: #dcddde;
      }
    `);

    this.themes.set("amoled", `
      * { background: #000000 !important; }
      [class*="text"] { color: #ffffff !important; }
    `);
    
    // Inject Ghost Archive CSS
    this.injectPluginStyles();
  }
  
  private injectPluginStyles() {
    const ghostArchiveCSS = `
      /* Ghost Archive - Noir Style */
      .ghost-archive-button {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        margin: 0 8px;
        cursor: pointer;
        font-size: 18px;
        color: #3CAEA3;
        background: #000000;
        border-radius: 4px;
        transition: none;
        user-select: none;
      }
      .ghost-archive-button:hover { background: #1a1a1a; }
      .ghost-archive-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        display: none;
        align-items: center;
        justify-content: center;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        font-size: 10px;
        font-weight: 600;
        color: #000000;
        background: #3CAEA3;
        border-radius: 8px;
      }
      .ghost-archive-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.85);
        z-index: 9999;
      }
      .ghost-archive-modal {
        width: 600px;
        max-width: 90vw;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        background: #000000;
        border: 1px solid #3CAEA3;
        border-radius: 4px;
        box-shadow: 0 8px 24px rgba(60, 174, 163, 0.2);
      }
      .ghost-archive-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        font-size: 16px;
        font-weight: 600;
        color: #3CAEA3;
        border-bottom: 1px solid #1a1a1a;
      }
      .ghost-archive-close {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        color: #666666;
        background: transparent;
        border: none;
        cursor: pointer;
        transition: none;
      }
      .ghost-archive-close:hover { color: #3CAEA3; }
      .ghost-archive-content {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        color: #cccccc;
      }
      .ghost-archive-content::-webkit-scrollbar { width: 8px; }
      .ghost-archive-content::-webkit-scrollbar-track { background: #000000; }
      .ghost-archive-content::-webkit-scrollbar-thumb { background: #3CAEA3; border-radius: 4px; }
      .ghost-archive-empty {
        text-align: center;
        padding: 32px;
        color: #666666;
        font-size: 14px;
      }
      .ghost-archive-item {
        display: flex;
        gap: 8px;
        padding: 8px;
        margin-bottom: 8px;
        background: #0a0a0a;
        border-left: 2px solid #3CAEA3;
        font-size: 13px;
        line-height: 1.4;
        contain: paint;
      }
      .ghost-archive-time {
        flex-shrink: 0;
        color: #666666;
        font-family: monospace;
      }
      .ghost-archive-author {
        flex-shrink: 0;
        color: #3CAEA3;
        font-weight: 600;
      }
      .ghost-archive-text {
        flex: 1;
        color: #cccccc;
        word-break: break-word;
      }
      .ghost-archive-footer {
        display: flex;
        justify-content: flex-end;
        padding: 16px;
        border-top: 1px solid #1a1a1a;
      }
      .ghost-archive-clear {
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 600;
        color: #000000;
        background: #3CAEA3;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: none;
      }
      .ghost-archive-clear:hover { background: #2d8a81; }
      .ghost-archive-clear:active { background: #236b64; }
    `;
    
    const pluginStyles = document.createElement("style");
    pluginStyles.id = "savecord-plugin-styles";
    pluginStyles.textContent = ghostArchiveCSS;
    document.head.appendChild(pluginStyles);
  }

  apply(themeName: string) {
    const css = this.themes.get(themeName);
    if (!css) {
      console.error(`[ThemeManager] Theme not found: ${themeName}`);
      return;
    }

    if (this.styleElement) {
      this.styleElement.remove();
    }

    this.styleElement = document.createElement("style");
    this.styleElement.id = "savecord-theme";
    this.styleElement.textContent = css;
    document.head.appendChild(this.styleElement);

    storage.set("theme.current", themeName);
  }

  applyCustomCSS(css: string) {
    if (this.styleElement) {
      this.styleElement.remove();
    }

    this.styleElement = document.createElement("style");
    this.styleElement.id = "savecord-custom-theme";
    this.styleElement.textContent = css;
    document.head.appendChild(this.styleElement);

    storage.set("theme.custom", css);
  }

  remove() {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
    storage.delete("theme.current");
  }

  getThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  addTheme(name: string, css: string) {
    this.themes.set(name, css);
  }
}
