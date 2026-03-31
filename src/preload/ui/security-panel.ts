import { configManager } from "../config-manager";

const NOIR_STYLES = `
.savecord-security-panel {
  background: #000000;
  border: 1px solid #1E3A8A;
  border-radius: 8px;
  padding: 20px;
  color: #FFFFFF;
  font-family: 'Consolas', 'Courier New', monospace;
  max-width: 600px;
  margin: 20px auto;
  box-shadow: 0 0 20px rgba(30, 58, 138, 0.3);
}

.savecord-security-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #1E3A8A, #3B82F6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.savecord-security-subtitle {
  font-size: 12px;
  color: #666;
  margin-bottom: 20px;
}

.savecord-security-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 4px;
}

.savecord-security-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.savecord-security-input {
  width: 100%;
  padding: 12px;
  background: #000000;
  border: 1px solid #1E3A8A;
  border-radius: 4px;
  color: #FFFFFF;
  font-family: 'Consolas', monospace;
  font-size: 14px;
  transition: all 0.3s ease;
}

.savecord-security-input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

.savecord-security-input.success {
  border-color: #10B981;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
}

.savecord-security-input.error {
  border-color: #EF4444;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
}

.savecord-security-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.savecord-security-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-family: 'Consolas', monospace;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.savecord-security-btn-primary {
  background: linear-gradient(135deg, #1E3A8A, #3B82F6);
  color: #FFFFFF;
  flex: 1;
}

.savecord-security-btn-primary:hover {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  transform: translateY(-2px);
}

.savecord-security-btn-secondary {
  background: #1a1a1a;
  color: #FFFFFF;
  border: 1px solid #333;
  flex: 1;
}

.savecord-security-btn-secondary:hover {
  background: #2a2a2a;
  border-color: #1E3A8A;
}

.savecord-security-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.savecord-security-status {
  margin-top: 10px;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.savecord-security-status.success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid #10B981;
  color: #10B981;
}

.savecord-security-status.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #EF4444;
  color: #EF4444;
}

.savecord-security-status.warning {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid #F59E0B;
  color: #F59E0B;
}

.savecord-security-status.info {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid #3B82F6;
  color: #3B82F6;
}

.savecord-security-shield-status {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 4px;
  margin-bottom: 20px;
}

.savecord-security-shield-icon {
  font-size: 24px;
}

.savecord-security-shield-text {
  flex: 1;
}

.savecord-security-shield-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 4px;
}

.savecord-security-shield-subtitle {
  font-size: 11px;
  color: #666;
}

.savecord-security-link {
  color: #3B82F6;
  text-decoration: none;
  font-size: 11px;
  display: inline-block;
  margin-top: 8px;
  transition: color 0.3s ease;
}

.savecord-security-link:hover {
  color: #60A5FA;
  text-decoration: underline;
}
`;

export class SecurityPanel {
  private container: HTMLElement | null = null;
  private apiKeyInput: HTMLInputElement | null = null;
  private statusDiv: HTMLElement | null = null;
  private testBtn: HTMLButtonElement | null = null;
  private saveBtn: HTMLButtonElement | null = null;

  constructor() {
    this.injectStyles();
  }

  private injectStyles(): void {
    if (document.getElementById("savecord-security-styles")) return;

    const style = document.createElement("style");
    style.id = "savecord-security-styles";
    style.textContent = NOIR_STYLES;
    document.head.appendChild(style);
  }

  render(): HTMLElement {
    this.container = document.createElement("div");
    this.container.className = "savecord-security-panel";

    const isShieldActive = configManager.isShieldEnabled();
    const currentKey = configManager.getVTApiKey();

    this.container.innerHTML = `
      <div class="savecord-security-title">🛡️ SECURITY SHIELD</div>
      <div class="savecord-security-subtitle">VirusTotal Integration</div>

      <div class="savecord-security-shield-status">
        <div class="savecord-security-shield-icon">${isShieldActive ? "✅" : "⚠️"}</div>
        <div class="savecord-security-shield-text">
          <div class="savecord-security-shield-title">
            ${isShieldActive ? "Shield Active" : "Shield Inactive"}
          </div>
          <div class="savecord-security-shield-subtitle">
            ${isShieldActive ? "Real-time malware scanning enabled" : "Provide API Key to enable protection"}
          </div>
        </div>
      </div>

      <div class="savecord-security-section">
        <label class="savecord-security-label">VirusTotal API Key</label>
        <input 
          type="password" 
          class="savecord-security-input" 
          id="savecord-vt-api-key"
          placeholder="Enter your VirusTotal API key..."
          value="${currentKey}"
        />
        <a 
          href="https://www.virustotal.com/gui/my-apikey" 
          target="_blank" 
          class="savecord-security-link"
        >
          🔑 Get your free API key from VirusTotal
        </a>
        <div class="savecord-security-buttons">
          <button class="savecord-security-btn savecord-security-btn-secondary" id="savecord-test-btn">
            Test Connection
          </button>
          <button class="savecord-security-btn savecord-security-btn-primary" id="savecord-save-btn">
            Save Key
          </button>
        </div>
        <div id="savecord-status" style="display: none;"></div>
      </div>

      <div class="savecord-security-section">
        <div class="savecord-security-label">About Security Shield</div>
        <div style="font-size: 11px; color: #999; line-height: 1.6;">
          Security Shield scans all file attachments using VirusTotal's database of 70+ antivirus engines.
          Your API key is stored locally and never sent to our servers. You have full control over your privacy.
        </div>
      </div>
    `;

    this.apiKeyInput = this.container.querySelector("#savecord-vt-api-key");
    this.statusDiv = this.container.querySelector("#savecord-status");
    this.testBtn = this.container.querySelector("#savecord-test-btn");
    this.saveBtn = this.container.querySelector("#savecord-save-btn");

    this.attachEventListeners();

    return this.container;
  }

  private attachEventListeners(): void {
    this.testBtn?.addEventListener("click", () => this.testConnection());
    this.saveBtn?.addEventListener("click", () => this.saveApiKey());
  }

  private async testConnection(): Promise<void> {
    const apiKey = this.apiKeyInput?.value.trim() || "";

    if (!apiKey) {
      this.showStatus("Please enter an API key", "error");
      return;
    }

    this.setButtonsEnabled(false);
    this.showStatus("Testing connection...", "info");

    try {
      const response = await fetch("https://www.virustotal.com/api/v3/users/current", {
        headers: {
          "x-apikey": apiKey,
        },
      });

      if (response.ok) {
        this.showStatus("✓ Connection successful! API key is valid", "success");
        this.apiKeyInput?.classList.add("success");
        this.apiKeyInput?.classList.remove("error");
      } else if (response.status === 401) {
        this.showStatus("✗ Invalid API key", "error");
        this.apiKeyInput?.classList.add("error");
        this.apiKeyInput?.classList.remove("success");
      } else {
        this.showStatus(`✗ Connection failed (HTTP ${response.status})`, "error");
        this.apiKeyInput?.classList.add("error");
        this.apiKeyInput?.classList.remove("success");
      }
    } catch (err) {
      this.showStatus("✗ Network error - check your connection", "error");
      this.apiKeyInput?.classList.add("error");
      this.apiKeyInput?.classList.remove("success");
    } finally {
      this.setButtonsEnabled(true);
    }
  }

  private saveApiKey(): void {
    const apiKey = this.apiKeyInput?.value.trim() || "";

    if (!apiKey) {
      this.showStatus("Please enter an API key", "error");
      return;
    }

    configManager.setVTApiKey(apiKey);
    this.showStatus("✓ API key saved successfully", "success");

    setTimeout(() => {
      this.refreshPanel();
    }, 1500);
  }

  private showStatus(message: string, type: "success" | "error" | "warning" | "info"): void {
    if (!this.statusDiv) return;

    this.statusDiv.textContent = message;
    this.statusDiv.className = `savecord-security-status ${type}`;
    this.statusDiv.style.display = "block";
  }

  private setButtonsEnabled(enabled: boolean): void {
    if (this.testBtn) this.testBtn.disabled = !enabled;
    if (this.saveBtn) this.saveBtn.disabled = !enabled;
  }

  private refreshPanel(): void {
    if (!this.container) return;
    const parent = this.container.parentElement;
    if (parent) {
      this.container.remove();
      parent.appendChild(this.render());
    }
  }
}
