import { NoirPlugin } from "../types/plugin";
import { Storage } from "./storage";
import { Webpack } from "../webpack";
import { Patcher } from "../webpack/patcher";
import { ThemeManager } from "../themes";
import { Disposable } from "../utils/performance";
import { injectSecuritySettings } from "./ui/settings-integration";

const SAVECORD_DEFAULT_CSS = `
  /* Savecord Default Theme - Optimized for HD 6670 */
  :root {
    --savecord-bg-primary: #0a0e27;
    --savecord-bg-secondary: #0f1535;
    --savecord-bg-tertiary: #141b3d;
    --savecord-accent: #1E3A8A;
    --savecord-accent-light: #3B82F6;
    --savecord-text: #dcddde;
  }

  body, .theme-dark {
    background: var(--savecord-bg-primary) !important;
  }

  [class*="sidebar"], [class*="panels"] {
    background: var(--savecord-bg-secondary) !important;
    content-visibility: auto;
    contain: paint;
  }

  [class*="chat"], [class*="content"] {
    background: var(--savecord-bg-primary) !important;
    content-visibility: auto;
    contain: layout style paint;
  }

  [class*="selected"], [class*="active"] {
    background: var(--savecord-accent) !important;
  }

  button:hover, [class*="button"]:hover {
    background: var(--savecord-accent-light) !important;
  }

  * {
    color: var(--savecord-text);
  }

  /* Performance optimizations for legacy GPU */
  * {
    animation-duration: 0.05s !important;
    transition-duration: 0.05s !important;
    will-change: auto !important;
  }

  [class*="scroller"] {
    content-visibility: auto;
    contain: layout style paint;
  }
`;

let defaultThemeElement: HTMLStyleElement | null = null;

function applyDefaultTheme() {
  if (defaultThemeElement) return;

  defaultThemeElement = document.createElement("style");
  defaultThemeElement.id = "savecord-default";
  defaultThemeElement.textContent = SAVECORD_DEFAULT_CSS;
  document.head.appendChild(defaultThemeElement);
}

function removeDefaultTheme() {
  if (defaultThemeElement) {
    defaultThemeElement.remove();
    defaultThemeElement = null;
  }
}

interface PluginLoadPriority {
  critical: string[];
  high: string[];
  normal: string[];
  deferred: string[];
}

const PLUGIN_PRIORITIES = Object.freeze<PluginLoadPriority>({
  critical: ["nuclear-ui", "quick-bar", "onion-privacy", "security-shield"],
  high: ["theme-manager", "zapret-refresh"],
  normal: ["quick-css", "media-killswitch", "ghost-archive"],
  deferred: ["ghost-mode", "radio-mode", "soundcloud-controller", "soundcloud-rpc", "message-logger"],
});

class PluginManager {
  private plugins: Map<string, NoirPlugin> = new Map();
  private storage = new Storage();
  private webpackReady = false;
  private disposables = new Disposable();
  private userLoggedIn = false;

  constructor() {
    this.hookWebpack();
    this.blockAnalytics();
    this.initDefaultTheme();
    this.detectUserLogin();
  }

  private initDefaultTheme() {
    const theme = this.storage.get("settings.theme", "savecord");
    const nuclearEnabled = this.storage.get("nuclear.enabled", false);

    if (theme === "savecord" && !nuclearEnabled) {
      applyDefaultTheme();
    }
  }

  private detectUserLogin() {
    const checkLogin = () => {
      const UserStore = Webpack.findByProps("getCurrentUser");
      if (UserStore?.getCurrentUser?.()) {
        this.userLoggedIn = true;
        this.loadDeferredPlugins();
      } else {
        setTimeout(checkLogin, 1000);
      }
    };

    requestIdleCallback(() => checkLogin());
  }

  private hookWebpack() {
    Object.defineProperty(window, "webpackChunkdiscord_app", {
      get: () => this._webpackChunk,
      set: (value) => {
        this._webpackChunk = value;
        this.onWebpackReady();
      },
      configurable: true,
    });
  }

  private _webpackChunk: any;

  private onWebpackReady() {
    if (this.webpackReady) return;
    this.webpackReady = true;
    
    requestIdleCallback(() => {
      this.loadPluginsByPriority();
      injectSecuritySettings();
    });
  }

  private blockAnalytics() {
    requestIdleCallback(() => {
      const Dispatcher = Webpack.findByProps("dispatch", "subscribe");
      if (!Dispatcher) return;

      const unpatch = Patcher.before(Dispatcher, "dispatch", (args) => {
        const [event] = args;
        if (
          event.type?.includes("TRACK") ||
          event.type?.includes("ANALYTICS") ||
          event.type?.includes("METRICS")
        ) {
          return [];
        }
      });

      this.disposables.add(unpatch);
    });
  }

  private async loadPluginsByPriority() {
    // Critical plugins - load immediately
    await this.loadPluginGroup(PLUGIN_PRIORITIES.critical);

    // High priority - load after 100ms
    setTimeout(() => this.loadPluginGroup(PLUGIN_PRIORITIES.high), 100);

    // Normal priority - load after 500ms
    setTimeout(() => this.loadPluginGroup(PLUGIN_PRIORITIES.normal), 500);
  }

  private async loadDeferredPlugins() {
    await this.loadPluginGroup(PLUGIN_PRIORITIES.deferred);
  }

  private async loadPluginGroup(pluginNames: string[]) {
    for (const name of pluginNames) {
      try {
        const module = await import(`./plugins/${name}`);
        await this.loadPlugin(module.default);
      } catch (err) {
        // Silent fail in production
      }
    }
  }

  async loadPlugin(plugin: NoirPlugin) {
    this.plugins.set(plugin.name, plugin);
    const enabled = this.storage.get(`plugin.${plugin.name}.enabled`, true);
    
    if (enabled) {
      try {
        await plugin.onStart();
      } catch (err) {
        // Silent fail in production
      }
    }
  }

  async unloadPlugin(name: string) {
    const plugin = this.plugins.get(name);
    if (plugin) {
      await plugin.onStop();
      this.plugins.delete(name);
    }
  }

  getPlugin(name: string): NoirPlugin | undefined {
    return this.plugins.get(name);
  }

  getAllPlugins(): NoirPlugin[] {
    return Array.from(this.plugins.values());
  }

  cleanup() {
    this.disposables.dispose();
    this.plugins.clear();
  }
}

const manager = new PluginManager();
const themeManager = new ThemeManager();

(window as any).Savecord = { 
  manager, 
  Storage, 
  Webpack, 
  Patcher, 
  ThemeManager: themeManager,
  applyDefaultTheme,
  removeDefaultTheme
};
