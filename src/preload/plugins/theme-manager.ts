import { definePlugin } from "../../types/plugin";
import { ThemeManager } from "../../themes";
import { Storage } from "../storage";
import { showPerformanceWarning } from "../performance-warning";

const themeManager = new ThemeManager();
const storage = new Storage();

export default definePlugin({
  name: "Theme Manager",
  version: "1.0.0",
  author: "Savecord",
  description: "Apply custom themes and CSS to Discord",

  onStart() {
    const savedTheme = storage.get("theme.current", "");
    if (savedTheme) {
      themeManager.apply(savedTheme);
    }

    const customCSS = storage.get("theme.custom", "");
    if (customCSS) {
      themeManager.applyCustomCSS(customCSS);
    }

    requestIdleCallback(() => {
      addThemeSelector();
    });
  },

  onStop() {
    themeManager.remove();
  },

  getSettingsPanel() {
    const panel = document.createElement("div");
    panel.style.cssText = "padding:16px;color:#fff;";
    
    const title = document.createElement("h3");
    title.textContent = "Theme Manager";
    title.style.cssText = "margin:0 0 12px 0;";
    
    const desc = document.createElement("p");
    desc.textContent = "Выберите тему или добавьте свой CSS";
    desc.style.cssText = "margin:0 0 16px 0;font-size:12px;color:#aaa;";
    
    const select = document.createElement("select");
    select.style.cssText = "width:100%;padding:8px;background:#333;color:#fff;border:1px solid #555;margin-bottom:16px;";
    
    const themes = themeManager.getThemes();
    themes.forEach((theme) => {
      const option = document.createElement("option");
      option.value = theme;
      option.textContent = theme;
      if (storage.get("theme.current") === theme) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    select.onchange = () => {
      const isResourceIntensive = select.value !== "nuclear" && select.value !== "amoled";
      
      if (isResourceIntensive) {
        showPerformanceWarning(`Тема: ${select.value}`, () => {
          themeManager.apply(select.value);
        });
      } else {
        themeManager.apply(select.value);
      }
    };

    const textarea = document.createElement("textarea");
    textarea.placeholder = "Вставьте свой CSS здесь...";
    textarea.style.cssText = "width:100%;height:150px;padding:8px;background:#222;color:#fff;border:1px solid #555;font-family:monospace;margin-bottom:12px;resize:vertical;";
    textarea.value = storage.get("theme.custom", "");

    const applyBtn = document.createElement("button");
    applyBtn.textContent = "Применить Custom CSS";
    applyBtn.style.cssText = "padding:8px 16px;background:#1E3A8A;color:#fff;border:none;cursor:pointer;";
    
    applyBtn.onclick = () => {
      showPerformanceWarning("Custom CSS", () => {
        themeManager.applyCustomCSS(textarea.value);
      });
    };

    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Очистить";
    clearBtn.style.cssText = "padding:8px 16px;background:#333;color:#fff;border:none;cursor:pointer;margin-left:8px;";
    
    clearBtn.onclick = () => {
      themeManager.remove();
      textarea.value = "";
      storage.delete("theme.custom");
    };
    
    panel.appendChild(title);
    panel.appendChild(desc);
    panel.appendChild(select);
    panel.appendChild(textarea);
    panel.appendChild(applyBtn);
    panel.appendChild(clearBtn);
    
    return panel;
  },

});

function addThemeSelector() {
  // Add theme selector to settings if needed
}
