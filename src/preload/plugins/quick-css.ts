import { definePlugin } from "../../types/plugin";
import { Storage } from "../storage";

const storage = new Storage();
let styleElement: HTMLStyleElement | null = null;

function applyCSS(css: string) {
  if (styleElement) {
    styleElement.textContent = css;
  } else {
    styleElement = document.createElement("style");
    styleElement.id = "savecord-quickcss";
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
  }
  storage.set("quickcss.content", css);
}

export default definePlugin({
  name: "Quick CSS",
  version: "1.0.0",
  author: "Savecord",
  description: "Quick CSS editor with live preview",

  onStart() {
    const savedCSS = storage.get("quickcss.content", "");
    if (savedCSS) {
      applyCSS(savedCSS);
    }
  },

  onStop() {
    if (styleElement) {
      styleElement.remove();
      styleElement = null;
    }
  },

  getSettingsPanel() {
    const panel = document.createElement("div");
    panel.style.cssText = "padding:16px;color:#fff;display:flex;flex-direction:column;height:100%;";
    
    const title = document.createElement("h3");
    title.textContent = "Quick CSS Editor";
    title.style.cssText = "margin:0 0 12px 0;";
    
    const desc = document.createElement("p");
    desc.textContent = "Изменения применяются автоматически при вводе";
    desc.style.cssText = "margin:0 0 16px 0;font-size:12px;color:#aaa;";
    
    const editor = document.createElement("textarea");
    editor.style.cssText = `
      flex: 1;
      padding: 12px;
      background: #1E1E1E;
      color: #D4D4D4;
      border: 1px solid #333;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 13px;
      line-height: 1.5;
      resize: none;
      tab-size: 2;
    `;
    editor.value = storage.get("quickcss.content", "");
    editor.placeholder = `/* Ваш CSS здесь */\n\n/* Пример: */\n.chat {\n  background: #000;\n}`;

    let timeout: any;
    editor.oninput = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        applyCSS(editor.value);
      }, 500);
    };

    editor.onkeydown = (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.value = editor.value.substring(0, start) + "  " + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + 2;
      }
    };

    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = "display:flex;gap:8px;margin-top:12px;";

    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Очистить";
    clearBtn.style.cssText = "padding:8px 16px;background:#333;color:#fff;border:none;cursor:pointer;";
    clearBtn.onclick = () => {
      editor.value = "";
      applyCSS("");
    };

    const resetBtn = document.createElement("button");
    resetBtn.textContent = "Сбросить";
    resetBtn.style.cssText = "padding:8px 16px;background:#555;color:#fff;border:none;cursor:pointer;";
    resetBtn.onclick = () => {
      editor.value = storage.get("quickcss.content", "");
    };

    buttonContainer.appendChild(clearBtn);
    buttonContainer.appendChild(resetBtn);
    
    panel.appendChild(title);
    panel.appendChild(desc);
    panel.appendChild(editor);
    panel.appendChild(buttonContainer);
    
    return panel;
  },
});
