import { definePlugin } from "../../types/plugin";
import { Webpack } from "../../webpack";
import { Patcher } from "../../webpack/patcher";
import { Storage } from "../storage";

const storage = new Storage();
const deletedMessages = new Map<string, any>();
const editedMessages = new Map<string, any[]>();
const unpatches: Array<() => void> = [];

function patchMessageActions() {
  const MessageActions = Webpack.findByProps("deleteMessage", "editMessage");
  if (!MessageActions) return;

  const unpatch1 = Patcher.before(MessageActions, "deleteMessage", (args) => {
    const [channelId, messageId] = args;
    const MessageStore = Webpack.findByProps("getMessage");
    if (MessageStore) {
      const message = MessageStore.getMessage(channelId, messageId);
      if (message) {
        deletedMessages.set(messageId, { ...message, deleted: true });
      }
    }
  });

  const unpatch2 = Patcher.before(MessageActions, "editMessage", (args) => {
    const [channelId, messageId] = args;
    const MessageStore = Webpack.findByProps("getMessage");
    if (MessageStore) {
      const message = MessageStore.getMessage(channelId, messageId);
      if (message) {
        if (!editedMessages.has(messageId)) {
          editedMessages.set(messageId, []);
        }
        editedMessages.get(messageId)!.push({
          content: message.content,
          timestamp: Date.now(),
        });
      }
    }
  });

  unpatches.push(unpatch1, unpatch2);
}

export default definePlugin({
  name: "Message Logger",
  version: "1.0.0",
  author: "Savecord",
  description: "Log deleted and edited messages",

  onStart() {
    if (!storage.get("messageLogger.enabled", false)) return;

    requestIdleCallback(() => {
      patchMessageActions();
    });
  },

  onStop() {
    unpatches.forEach((unpatch) => unpatch());
    unpatches.length = 0;
  },

  getSettingsPanel() {
    const panel = document.createElement("div");
    panel.style.cssText = "padding:16px;color:#fff;";
    
    const title = document.createElement("h3");
    title.textContent = "Message Logger";
    title.style.cssText = "margin:0 0 12px 0;";
    
    const desc = document.createElement("p");
    desc.textContent = "Сохраняет удаленные и отредактированные сообщения";
    desc.style.cssText = "margin:0 0 16px 0;font-size:12px;color:#aaa;";
    
    const toggle = document.createElement("button");
    toggle.textContent = storage.get("messageLogger.enabled") ? "Отключить" : "Включить";
    toggle.style.cssText = "padding:8px 16px;background:#1E3A8A;color:#fff;border:none;cursor:pointer;margin-bottom:16px;";
    
    toggle.onclick = () => {
      const current = storage.get("messageLogger.enabled", false);
      storage.set("messageLogger.enabled", !current);
      toggle.textContent = !current ? "Отключить" : "Включить";
      
      if (!current) {
        patchMessageActions();
      } else {
        unpatches.forEach((unpatch) => unpatch());
        unpatches.length = 0;
      }
    };

    const stats = document.createElement("p");
    stats.textContent = `Удалено: ${deletedMessages.size} | Отредактировано: ${editedMessages.size}`;
    stats.style.cssText = "margin:0;font-size:12px;color:#888;";
    
    panel.appendChild(title);
    panel.appendChild(desc);
    panel.appendChild(toggle);
    panel.appendChild(stats);
    
    return panel;
  },
});
