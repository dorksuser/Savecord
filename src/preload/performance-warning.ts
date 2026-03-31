import { Storage } from "./storage";

const storage = new Storage();

export function showPerformanceWarning(feature: string, callback: () => void) {
  if (storage.get("warnings.dismissed", false)) {
    callback();
    return;
  }

  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;

  const modal = document.createElement("div");
  modal.style.cssText = `
    background: #1E1E1E;
    border: 2px solid #FF6B6B;
    padding: 24px;
    max-width: 500px;
    color: #fff;
  `;

  const title = document.createElement("h2");
  title.textContent = "⚠️ Предупреждение о производительности";
  title.style.cssText = "margin: 0 0 16px 0; color: #FF6B6B;";

  const message = document.createElement("p");
  message.textContent = `Вы собираетесь включить "${feature}". На слабых ПК (Pentium G850 / HD 6670) это может снизить производительность клиента и системы.`;
  message.style.cssText = "margin: 0 0 16px 0; line-height: 1.5;";

  const warning = document.createElement("p");
  warning.textContent = "Рекомендуется использовать только Nuclear Mode для максимальной производительности.";
  warning.style.cssText = "margin: 0 0 24px 0; font-size: 12px; color: #aaa;";

  const buttonContainer = document.createElement("div");
  buttonContainer.style.cssText = "display: flex; gap: 12px;";

  const continueBtn = document.createElement("button");
  continueBtn.textContent = "Продолжить";
  continueBtn.style.cssText = `
    flex: 1;
    padding: 12px;
    background: #1E3A8A;
    color: #fff;
    border: none;
    cursor: pointer;
    font-size: 14px;
  `;

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Отмена";
  cancelBtn.style.cssText = `
    flex: 1;
    padding: 12px;
    background: #333;
    color: #fff;
    border: none;
    cursor: pointer;
    font-size: 14px;
  `;

  const dontShowAgain = document.createElement("label");
  dontShowAgain.style.cssText = "display: block; margin-top: 16px; font-size: 12px; cursor: pointer;";
  
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.style.cssText = "margin-right: 8px;";
  
  dontShowAgain.appendChild(checkbox);
  dontShowAgain.appendChild(document.createTextNode("Больше не показывать"));

  continueBtn.onclick = () => {
    if (checkbox.checked) {
      storage.set("warnings.dismissed", true);
    }
    overlay.remove();
    callback();
  };

  cancelBtn.onclick = () => {
    overlay.remove();
  };

  buttonContainer.appendChild(continueBtn);
  buttonContainer.appendChild(cancelBtn);

  modal.appendChild(title);
  modal.appendChild(message);
  modal.appendChild(warning);
  modal.appendChild(buttonContainer);
  modal.appendChild(dontShowAgain);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}
