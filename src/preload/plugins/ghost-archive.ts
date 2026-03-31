import { definePlugin } from "../../types/plugin";
import { Webpack } from "../../webpack";

interface DeletedMessage {
  readonly id: string;
  readonly content: string;
  readonly author: string;
  readonly authorId: string;
  readonly timestamp: number;
  readonly channelId: string;
}

const MAX_MESSAGES_PER_CHANNEL = 50;
const archive = new Map<string, DeletedMessage[]>();
let currentChannelId: string | null = null;
let archiveButton: HTMLElement | null = null;
let unsubscribers: Array<() => void> = [];
let observer: MutationObserver | null = null;
let isOptimized = false;
let updateInterval = 1000; // Default 1s

// Escape HTML to prevent XSS
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Add to archive with limit
function addToArchive(channelId: string, message: DeletedMessage): void {
  if (!archive.has(channelId)) {
    archive.set(channelId, []);
  }
  
  const messages = archive.get(channelId)!;
  messages.unshift(message);
  
  // Keep only last 50 messages
  if (messages.length > MAX_MESSAGES_PER_CHANNEL) {
    messages.length = MAX_MESSAGES_PER_CHANNEL;
  }
}

// Update badge counter
function updateBadge(): void {
  if (!archiveButton || !currentChannelId) return;
  
  const count = archive.get(currentChannelId)?.length || 0;
  const badge = archiveButton.querySelector(".ghost-archive-badge") as HTMLElement;
  
  if (badge) {
    badge.textContent = count > 99 ? "99+" : String(count);
    badge.style.display = count > 0 ? "flex" : "none";
  }
}

// Create archive viewer modal
function showArchiveViewer(): void {
  if (!currentChannelId) return;
  
  const messages = archive.get(currentChannelId) || [];
  
  // Create modal overlay
  const overlay = document.createElement("div");
  overlay.className = "ghost-archive-overlay";
  
  // Create modal
  const modal = document.createElement("div");
  modal.className = "ghost-archive-modal";
  
  // Header
  const header = document.createElement("div");
  header.className = "ghost-archive-header";
  header.innerHTML = `
    <span>🗑️ Ghost Archive (${messages.length})</span>
    <button class="ghost-archive-close">✕</button>
  `;
  
  // Content
  const content = document.createElement("div");
  content.className = "ghost-archive-content";
  
  if (messages.length === 0) {
    content.innerHTML = '<div class="ghost-archive-empty">No deleted messages</div>';
  } else {
    messages.forEach(msg => {
      const item = document.createElement("div");
      item.className = "ghost-archive-item";
      
      const time = new Date(msg.timestamp).toLocaleTimeString();
      item.innerHTML = `
        <div class="ghost-archive-time">[${time}]</div>
        <div class="ghost-archive-author">${escapeHtml(msg.author)}:</div>
        <div class="ghost-archive-text">${escapeHtml(msg.content)}</div>
      `;
      
      content.appendChild(item);
    });
  }
  
  // Footer
  const footer = document.createElement("div");
  footer.className = "ghost-archive-footer";
  
  const clearBtn = document.createElement("button");
  clearBtn.className = "ghost-archive-clear";
  clearBtn.textContent = "Clear Archive";
  clearBtn.onclick = () => {
    if (currentChannelId) {
      archive.delete(currentChannelId);
      updateBadge();
      overlay.remove();
    }
  };
  
  footer.appendChild(clearBtn);
  
  // Assemble modal
  modal.appendChild(header);
  modal.appendChild(content);
  modal.appendChild(footer);
  overlay.appendChild(modal);
  
  // Close handlers
  const closeBtn = header.querySelector(".ghost-archive-close") as HTMLElement;
  closeBtn.onclick = () => overlay.remove();
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };
  
  document.body.appendChild(overlay);
}

// Inject button into toolbar
function injectButton(): void {
  const toolbar = document.querySelector(".toolbar-3_rS6F, [class*='toolbar']");
  
  if (!toolbar || archiveButton) return;
  
  archiveButton = document.createElement("div");
  archiveButton.className = "ghost-archive-button";
  archiveButton.title = "Ghost Archive";
  archiveButton.innerHTML = `
    🗑️
    <span class="ghost-archive-badge">0</span>
  `;
  
  archiveButton.onclick = showArchiveViewer;
  
  toolbar.insertBefore(archiveButton, toolbar.firstChild);
  updateBadge();
}

export default definePlugin({
  name: "Ghost Archive",
  version: "1.0.0",
  author: "Savecord",
  description: "Track deleted messages without cluttering the UI",

  onStart() {
    // Listen for optimization events
    const handleOptimizeOn = () => {
      isOptimized = true;
      updateInterval = 10000; // 10s in optimized mode
    };
    
    const handleOptimizeOff = () => {
      isOptimized = false;
      updateInterval = 1000; // 1s in normal mode
    };
    
    window.addEventListener("HYPE_OPTIMIZE_ON", handleOptimizeOn);
    window.addEventListener("HYPE_OPTIMIZE_OFF", handleOptimizeOff);
    
    unsubscribers.push(
      () => window.removeEventListener("HYPE_OPTIMIZE_ON", handleOptimizeOn),
      () => window.removeEventListener("HYPE_OPTIMIZE_OFF", handleOptimizeOff)
    );
    
    // Find Discord modules
    const Dispatcher = Webpack.findByProps("subscribe", "dispatch");
    const SelectedChannelStore = Webpack.findByProps("getChannelId", "getVoiceChannelId");
    
    if (!Dispatcher || !SelectedChannelStore) {
      console.error("[GhostArchive] Required modules not found");
      return;
    }
    
    // Subscribe to message deletion events
    const handleDispatch = (event: any) => {
      if (event.type === "MESSAGE_DELETE") {
        const { id, channelId, message } = event;
        
        if (message) {
          const deletedMsg: DeletedMessage = Object.freeze({
            id: id || message.id,
            content: message.content || "[No content]",
            author: message.author?.username || "Unknown",
            authorId: message.author?.id || "0",
            timestamp: Date.now(),
            channelId: channelId
          });
          
          addToArchive(channelId, deletedMsg);
          
          // Throttle updates in optimized mode
          if (!isOptimized) {
            updateBadge();
          }
        }
      } else if (event.type === "MESSAGE_DELETE_BULK") {
        const { ids, channelId } = event;
        
        if (ids && Array.isArray(ids)) {
          ids.forEach((id: string) => {
            const deletedMsg: DeletedMessage = Object.freeze({
              id,
              content: "[Bulk deleted]",
              author: "Unknown",
              authorId: "0",
              timestamp: Date.now(),
              channelId
            });
            
            addToArchive(channelId, deletedMsg);
          });
          
          // Throttle updates in optimized mode
          if (!isOptimized) {
            updateBadge();
          }
        }
      } else if (event.type === "CHANNEL_SELECT") {
        currentChannelId = event.channelId;
        updateBadge();
      }
    };
    
    const unsub1 = Dispatcher.subscribe("MESSAGE_DELETE", handleDispatch);
    const unsub2 = Dispatcher.subscribe("MESSAGE_DELETE_BULK", handleDispatch);
    const unsub3 = Dispatcher.subscribe("CHANNEL_SELECT", handleDispatch);
    
    unsubscribers.push(unsub1, unsub2, unsub3);
    
    // Initialize current channel
    currentChannelId = SelectedChannelStore.getChannelId();
    
    // Periodic badge update in optimized mode
    const badgeUpdateTimer = setInterval(() => {
      if (isOptimized) {
        updateBadge();
      }
    }, updateInterval);
    
    unsubscribers.push(() => clearInterval(badgeUpdateTimer));
    
    // Observe for toolbar
    observer = new MutationObserver(() => {
      if (!archiveButton || !document.contains(archiveButton)) {
        archiveButton = null;
        requestIdleCallback(() => injectButton());
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Initial injection
    requestIdleCallback(() => injectButton());
  },

  onStop() {
    // Cleanup
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    
    unsubscribers.forEach(unsub => unsub());
    unsubscribers = [];
    
    if (archiveButton) {
      archiveButton.remove();
      archiveButton = null;
    }
    
    archive.clear();
    currentChannelId = null;
  }
});
