<div align="center">

<img src=".github/assets/banner.svg" alt="Savecord Banner" width="100%">

<br><br>

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/dorksuser/Savecord)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![Optimized](https://img.shields.io/badge/Optimized-G850%2FHD6670-orange.svg)](https://github.com/dorksuser/Savecord)

</div>

---

## 🎯 Philosophy

Savecord is built on three core principles:

1. **Performance First** - Every feature optimized for 2-core CPUs and legacy GPUs
2. **Privacy by Design** - Telemetry blocking, fingerprint spoofing, token protection
3. **Minimal Footprint** - Vanilla DOM, zero React overhead, aggressive tree-shaking

---

## ⚡ Key Features

### 🛡️ Security & Privacy
- **Security Shield** - VirusTotal integration with real-time malware scanning
- **Token Protection** - Automatic masking of Discord tokens in console
- **Anti-QR Phishing** - Blur suspicious QR codes with warnings
- **Panic Button** - Emergency data wipe (Ctrl+Alt+Shift+K)
- **Onion Privacy** - Telemetry blocking, fingerprint spoofing, EXIF stripping

### 🚀 Performance Optimization
- **Nuclear UI Mode** - True black theme with zero animations
- **Radio Mode** - Audio-only mode (UI freezer for gaming)
- **Master Optimization Toggle** - One-click performance boost
- **Lazy Plugin Loading** - Priority-based initialization
- **CSS Containment** - GPU optimization for HD 6670

### 👻 Stealth Features
- **Ghost Mode** - Typing stealth and read receipts blocking
- **Ghost Archive** - Track last 50 deleted messages per channel
- **Message Logger** - Log edited and deleted messages

### 🌐 Network & Connectivity
- **Zapret DPI Bypass** - Auto-prober with 3 strategies
- **Auto-Updater** - GitHub integration for Zapret updates
- **Proxy Support** - SOCKS5/Tor integration

### 🎵 Media Integration
- **SoundCloud Controller** - Native controls in Discord UI
- **SoundCloud RPC** - Rich presence integration
- **Media Killswitch** - Block heavy media for performance

---

## 📋 System Requirements

### Minimum
- **CPU:** Intel Pentium G850 (2 cores @ 2.9 GHz)
- **GPU:** AMD HD 6670
- **RAM:** 4GB DDR3
- **OS:** Windows 10/11

---

## 🔧 Installation

### Quick Start

```bash
# Clone repository
git clone https://github.com/dorksuser/Savecord.git
cd Savecord

# Install dependencies
npm install

# Build
npm run build

# Inject into Discord
node dist/injector.js

# Restart Discord
```

### 🔑 Security Shield Configuration

Savecord uses **your own** VirusTotal API key for malware scanning. This ensures complete privacy - your data never touches our servers.

1. Get your free API key: [VirusTotal API Key](https://www.virustotal.com/gui/my-apikey)
2. Open Discord settings → Savecord → Security Shield
3. Paste your API key and click "Test Connection"
4. Click "Save Key" to enable real-time malware scanning

**Why this approach?**
- ✅ Full control over your privacy
- ✅ No third-party key sharing
- ✅ Direct communication with VirusTotal
- ✅ Your data stays yours

---

## 📦 Build Windows Executable

```bash
# Install electron-builder
npm install --save-dev electron-builder

# Build .exe
npm run dist:win
```

The installer will be in `build/Savecord-1.0.0-Setup.exe`

---

## 🎮 Quick Start

- **⚡ Optimize** - Enable Nuclear CSS mode
- **Ctrl+Alt+Shift+K** - Panic button (emergency data wipe)
- **🗑️** - View deleted messages (Ghost Archive)

---

## 🎨 Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Build** | esbuild | 100x faster than webpack |
| **Runtime** | Electron | Sandboxed renderer access |
| **DOM** | Vanilla JS | Zero framework overhead |
| **Styling** | CSS Containment | GPU optimization |
| **Network** | Zapret | DPI bypass |
| **Security** | VirusTotal | Malware scanning |

---

## 📊 Performance

### Optimizations
- Lazy plugin loading
- LRU cache (max 100 entries)
- Request queue (4 req/min)
- Chunked hashing
- Tree-shaking enabled
- Console logs dropped in production

### Bundle Sizes
- Injector: 838 bytes
- Loader: 40.5 KB
- Preload: 72.4 KB

---

## ⚠️ Disclaimer

This is a client modification. Use at your own risk. Discord's Terms of Service prohibit client modifications.

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 🙏 Credits

- [Vencord](https://github.com/Vendicated/Vencord) - Plugin system inspiration
- [Zapret](https://github.com/bol-van/zapret) - DPI bypass tool
- [VirusTotal](https://www.virustotal.com/) - Malware scanning API

---

<div align="center">

**Made with ❤️ for low-end PC users**

[GitHub](https://github.com/dorksuser/Savecord) • [Issues](https://github.com/dorksuser/Savecord/issues) • [Discussions](https://github.com/dorksuser/Savecord/discussions)

</div>
