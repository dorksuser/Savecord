// Common Discord modules
import { Webpack } from "./index";

export const Dispatcher = Webpack.findByProps("dispatch", "subscribe");
export const FluxDispatcher = Dispatcher;

export const UserStore = Webpack.findByProps("getCurrentUser", "getUser");
export const ChannelStore = Webpack.findByProps("getChannel", "getDMFromUserId");
export const GuildStore = Webpack.findByProps("getGuild", "getGuilds");
export const SelectedChannelStore = Webpack.findByProps("getChannelId", "getVoiceChannelId");

export const MessageActions = Webpack.findByProps("sendMessage", "editMessage");
export const MessageStore = Webpack.findByProps("getMessage", "getMessages");

export const PermissionStore = Webpack.findByProps("can", "getGuildPermissions");
export const PresenceStore = Webpack.findByProps("getStatus", "getActivities");

export const React = Webpack.findByProps("createElement", "Component");
export const ReactDOM = Webpack.findByProps("render", "findDOMNode");

// Utilities
export function waitForStore(storeName: string, callback: (store: any) => void) {
  Webpack.waitFor((m) => m?.getName?.() === storeName, callback);
}

export function getModule(filter: (m: any) => boolean) {
  return Webpack.find(filter);
}
