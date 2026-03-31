export interface NoirPlugin {
  name: string;
  version: string;
  author: string;
  description?: string;
  onStart(): void | Promise<void>;
  onStop(): void | Promise<void>;
  getSettingsPanel?(): HTMLElement;
}

export function definePlugin(plugin: NoirPlugin): NoirPlugin {
  return plugin;
}
