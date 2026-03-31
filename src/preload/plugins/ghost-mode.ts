import { definePlugin } from "../../types/plugin";
import { Webpack } from "../../webpack";
import { Patcher } from "../../webpack/patcher";
import { Storage } from "../storage";

const storage = new Storage();
const unpatches: Array<() => void> = [];

function enableTypingStealth() {
  const Dispatcher = Webpack.findByProps("dispatch", "subscribe");
  if (!Dispatcher) return;

  const unpatch = Patcher.before(Dispatcher, "dispatch", (args) => {
    const [event] = args;
    if (event.type === "TYPING_START") {
      console.log("[Ghost Mode] Blocked TYPING_START event");
      return [];
    }
  });

  unpatches.push(unpatch);
}

function enableReadStealth() {
  const Gateway = Webpack.findByProps("send", "close");
  if (!Gateway) return;

  const unpatch = Patcher.before(Gateway, "send", (args) => {
    const [opcode, data] = args;
    
    if (data?.type === "MESSAGE_ACK" || data?.type === "CHANNEL_ACK") {
      console.log("[Ghost Mode] Blocked ACK packet");
      return [];
    }
  });

  unpatches.push(unpatch);
}

export default definePlugin({
  name: "Ghost Mode",
  version: "1.0.0",
  author: "Savecord",
  description: "Privacy features: typing stealth and read stealth",

  onStart() {
    const typingStealth = storage.get("ghostMode.typingStealth", false);
    const readStealth = storage.get("ghostMode.readStealth", false);

    if (typingStealth) {
      enableTypingStealth();
    }

    if (readStealth) {
      enableReadStealth();
    }
  },

  onStop() {
    unpatches.forEach((unpatch) => unpatch());
    unpatches.length = 0;
  },

  getSettingsPanel() {
    const panel = document.createElement("div");
    panel.style.cssText = "padding:16px;color:#fff;";
    
    const title = document.createElement("h3");
    title.textContent = "👻 Ghost Mode";
    title.style.cssText = "margin:0 0 12px 0;";
    
    const desc = document.createElement("p");
    desc.textContent = "Скрытый режим для приватности";
    desc.style.cssText = "margin:0 0 16px 0;font-size:12px;color:#aaa;";

    // Typing Stealth Toggle
    const typingContainer = document.createElement("div");
    typingContainer.style.cssText = "margin-bottom:16px;";

    const typingLabel = document.createElement("label");
    typingLabel.style.cssText = "display:flex;align-items:center;gap:8px;cursor:pointer;";

    const typingCheckbox = document.createElement("input");
    typingCheckbox.type = "checkbox";
    typingCheckbox.checked = storage.get("ghostMode.typingStealth", false);

    const typingText = document.createElement("span");
    typingText.textContent = "Typing Stealth (скрыть печать)";

    typingCheckbox.onchange = () => {
      storage.set("ghostMode.typingStealth", typingCheckbox.checked);
      
      if (typingCheckbox.checked) {
        enableTypingStealth();
      } else {
        unpatches.forEach((unpatch) => unpatch());
        unpatches.length = 0;
      }
    };

    typingLabel.appendChild(typingCheckbox);
    typingLabel.appendChild(typingText);
    typingContainer.appendChild(typingLabel);

    // Read Stealth Toggle
    const readContainer = document.createElement("div");
    readContainer.style.cssText = "margin-bottom:16px;";

    const readLabel = document.createElement("label");
    readLabel.style.cssText = "display:flex;align-items:center;gap:8px;cursor:pointer;";

    const readCheckbox = document.createElement("input");
    readCheckbox.type = "checkbox";
    readCheckbox.checked = storage.get("ghostMode.readStealth", false);

    const readText = document.createElement("span");
    readText.textContent = "Read Stealth (скрыть прочтение)";

    readCheckbox.onchange = () => {
      storage.set("ghostMode.readStealth", readCheckbox.checked);
      
      if (readCheckbox.checked) {
        enableReadStealth();
      } else {
        unpatches.forEach((unpatch) => unpatch());
        unpatches.length = 0;
      }
    };

    readLabel.appendChild(readCheckbox);
    readLabel.appendChild(readText);
    readContainer.appendChild(readLabel);

    const warning = document.createElement("p");
    warning.textContent = "⚠️ Использование на свой риск";
    warning.style.cssText = "margin:16px 0 0 0;font-size:11px;color:#FF6B6B;";
    
    panel.appendChild(title);
    panel.appendChild(desc);
    panel.appendChild(typingContainer);
    panel.appendChild(readContainer);
    panel.appendChild(warning);
    
    return panel;
  },
});
