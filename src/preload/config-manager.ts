import { Storage } from "./storage";

interface SavecordConfig {
  security: {
    vtApiKey: string;
    shieldEnabled: boolean;
  };
  performance: {
    nuclearMode: boolean;
    radioMode: boolean;
  };
}

const DEFAULT_CONFIG: SavecordConfig = {
  security: {
    vtApiKey: "",
    shieldEnabled: false,
  },
  performance: {
    nuclearMode: false,
    radioMode: false,
  },
};

export class ConfigManager {
  private storage = new Storage();
  private config: SavecordConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): SavecordConfig {
    try {
      const stored = this.storage.get("savecord.config", null);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...stored };
      }
    } catch (err) {
      console.error("[ConfigManager] Failed to load config:", err);
    }
    return { ...DEFAULT_CONFIG };
  }

  private saveConfig(): void {
    try {
      this.storage.set("savecord.config", this.config);
    } catch (err) {
      console.error("[ConfigManager] Failed to save config:", err);
    }
  }

  getVTApiKey(): string {
    return this.config.security.vtApiKey;
  }

  setVTApiKey(key: string): void {
    this.config.security.vtApiKey = key;
    this.config.security.shieldEnabled = key.length > 0;
    this.saveConfig();
  }

  isShieldEnabled(): boolean {
    return this.config.security.shieldEnabled && this.config.security.vtApiKey.length > 0;
  }

  getConfig(): SavecordConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<SavecordConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }
}

export const configManager = new ConfigManager();
