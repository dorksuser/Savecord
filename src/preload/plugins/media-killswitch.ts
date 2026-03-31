import { definePlugin } from "../../types/plugin";
import { Webpack } from "../../webpack";
import { Patcher } from "../../webpack/patcher";
import { Storage } from "../storage";

const storage = new Storage();
const unpatches: Array<() => void> = [];

function patchImageResolver() {
  const ImageResolver = Webpack.findByProps("getImageSrc", "getUserAvatarURL");
  if (!ImageResolver) return;

  const unpatch = Patcher.instead(ImageResolver, "getImageSrc", (args, original) => {
    if (!storage.get("mediaKillswitch.enabled", false)) {
      return original();
    }
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E";
  });

  unpatches.push(unpatch);
}

function patchEmbedRenderer() {
  const EmbedRenderer = Webpack.findByDisplayName("MessageEmbedAccessory");
  if (!EmbedRenderer) return;

  const unpatch = Patcher.after(EmbedRenderer, "type", (args, ret) => {
    if (!storage.get("mediaKillswitch.enabled", false)) return ret;

    const React = Webpack.findByProps("createElement");
    if (!React) return ret;

    return React.createElement("div", {
      style: {
        background: "#2A2A2A",
        padding: "20px",
        color: "#fff",
        textAlign: "center",
        cursor: "pointer",
      },
      onClick: () => {
        storage.set("mediaKillswitch.revealed." + args[0]?.embed?.id, true);
      },
    }, "Media Killswitch Active - Click to View");
  });

  unpatches.push(unpatch);
}

export default definePlugin({
  name: "Media Killswitch",
  version: "1.0.0",
  author: "Savecord",
  description: "Block media from loading to save bandwidth and CPU",

  onStart() {
    requestIdleCallback(() => {
      patchImageResolver();
      patchEmbedRenderer();
      console.log("[Media Killswitch] Patches applied");
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
    title.textContent = "Media Killswitch";
    title.style.cssText = "margin:0 0 12px 0;";
    
    const desc = document.createElement("p");
    desc.textContent = "Blocks images, GIFs, and videos from loading automatically.";
    desc.style.cssText = "margin:0 0 16px 0;font-size:12px;color:#aaa;";
    
    const toggle = document.createElement("button");
    toggle.textContent = storage.get("mediaKillswitch.enabled") ? "Disable" : "Enable";
    toggle.style.cssText = "padding:8px 16px;background:#1E3A8A;color:#fff;border:none;cursor:pointer;";
    
    toggle.onclick = () => {
      const current = storage.get("mediaKillswitch.enabled", false);
      storage.set("mediaKillswitch.enabled", !current);
      toggle.textContent = !current ? "Disable" : "Enable";
    };
    
    panel.appendChild(title);
    panel.appendChild(desc);
    panel.appendChild(toggle);
    
    return panel;
  },
});
