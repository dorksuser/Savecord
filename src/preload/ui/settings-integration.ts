import { SecurityPanel } from "./security-panel";

export function injectSecuritySettings(): void {
  // Wait for Discord settings to be available
  const checkInterval = setInterval(() => {
    const settingsContainer = document.querySelector('[class*="contentRegion"]');
    
    if (settingsContainer) {
      clearInterval(checkInterval);
      addSecurityTab();
    }
  }, 1000);

  // Timeout after 30 seconds
  setTimeout(() => clearInterval(checkInterval), 30000);
}

function addSecurityTab(): void {
  // Listen for custom event to open settings
  window.addEventListener("savecord:open-settings", ((event: CustomEvent) => {
    const { tab } = event.detail || {};
    
    if (tab === "security") {
      openSecuritySettings();
    }
  }) as EventListener);

  // Add Savecord section to Discord settings sidebar
  const observer = new MutationObserver(() => {
    const sidebar = document.querySelector('[class*="sidebar"]');
    
    if (!sidebar || document.getElementById("savecord-security-tab")) return;

    const savecordSection = document.createElement("div");
    savecordSection.style.cssText = `
      padding: 8px 10px;
      margin: 8px 0;
      border-top: 1px solid #1E3A8A;
      border-bottom: 1px solid #1E3A8A;
    `;

    const sectionTitle = document.createElement("div");
    sectionTitle.textContent = "SAVECORD";
    sectionTitle.style.cssText = `
      font-size: 11px;
      font-weight: bold;
      color: #3B82F6;
      margin-bottom: 4px;
      letter-spacing: 1px;
    `;

    const securityTab = document.createElement("div");
    securityTab.id = "savecord-security-tab";
    securityTab.textContent = "🛡️ Security Shield";
    securityTab.style.cssText = `
      padding: 8px 10px;
      margin: 2px 0;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      color: #FFFFFF;
      transition: all 0.2s ease;
    `;

    securityTab.onmouseenter = () => {
      securityTab.style.background = "rgba(30, 58, 138, 0.3)";
    };

    securityTab.onmouseleave = () => {
      securityTab.style.background = "transparent";
    };

    securityTab.onclick = () => {
      openSecuritySettings();
    };

    savecordSection.appendChild(sectionTitle);
    savecordSection.appendChild(securityTab);

    // Insert after "User Settings" section
    const userSettingsSection = Array.from(sidebar.children).find(
      (el) => el.textContent?.includes("My Account") || el.textContent?.includes("Profiles")
    );

    if (userSettingsSection) {
      userSettingsSection.after(savecordSection);
    } else {
      sidebar.appendChild(savecordSection);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function openSecuritySettings(): void {
  const contentRegion = document.querySelector('[class*="contentRegion"]');
  
  if (!contentRegion) {
    console.error("[Savecord] Content region not found");
    return;
  }

  // Clear existing content
  contentRegion.innerHTML = "";

  // Create security panel
  const securityPanel = new SecurityPanel();
  const panel = securityPanel.render();

  // Wrap in Discord-style container
  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    padding: 40px 20px;
    max-width: 740px;
    margin: 0 auto;
  `;
  wrapper.appendChild(panel);

  contentRegion.appendChild(wrapper);

  // Highlight active tab
  const tabs = document.querySelectorAll('[class*="sidebar"] > div');
  tabs.forEach((tab) => {
    if (tab.id === "savecord-security-tab") {
      (tab as HTMLElement).style.background = "rgba(30, 58, 138, 0.5)";
    } else {
      (tab as HTMLElement).style.background = "transparent";
    }
  });
}
