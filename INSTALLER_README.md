# Savecord Installer

High-performance Windows installer with Noir-style UI and deep Discord injection.

## Features

### 🎨 Noir Interface
- Frameless 600x400 window with draggable area
- Black (#000000) background with white (#FFFFFF) text
- Cobalt blue (#1E3A8A) accent with glowing effects
- Real-time console logging with color-coded messages
- Animated logo and status indicators

### 🔍 Discovery Engine
- Automatically scans for Discord installations:
  - `%LocalAppData%/Discord/` (Stable)
  - `%LocalAppData%/DiscordCanary/` (Canary)
  - `%LocalAppData%/DiscordPTB/` (PTB)
- Identifies highest version `app-*` folder
- Supports multiple Discord variants

### 💉 Injection Logic (Shimming)
- Creates `.bak` backup before modification
- Injects loader into `modules/discord_desktop_core/index.js`
- Automatic verification and rollback on failure
- Safe uninstall with backup restoration

### ⚡ G850 Optimization
- Minimal memory footprint during installation
- No React overhead (vanilla DOM)
- Efficient file operations
- Fast startup and execution

## Building

```bash
# Build installer
npm run build-installer

# Package installer
npm run dist:installer
```

Output: `build/installer/Savecord Installer-1.0.0-Setup.exe`

## Usage

1. Run `Savecord Installer-1.0.0-Setup.exe` as Administrator
2. Click "Initialize Savecord" to inject
3. Click "Launch Discord" when complete
4. Use "Restore Original" to uninstall

## Architecture

```
src/installer/
├── main.ts          - Electron main process
├── pathfinder.ts    - Discord discovery engine
├── injector.ts      - Injection/uninstall logic
└── ui.html          - Noir-style interface

scripts/
└── build-installer.mjs - Installer build script

electron-builder-installer.json - Installer packaging config
```

## Console Log Types

- `[SYS]` - System messages (blue)
- `[SUCCESS]` - Success messages (green)
- `[ERROR]` - Error messages (red)
- `[WARN]` - Warning messages (yellow)
- `[FOUND]` - Discovery results (green)

## Safety Features

- Automatic backup creation
- Injection verification
- Rollback on failure
- Admin rights requirement
- File existence checks

## Technical Details

- **Window**: 600x400px, frameless, non-resizable
- **Theme**: Pure black with cobalt accents
- **Font**: Consolas monospace
- **Animations**: Pulse, fade-in, glow effects
- **IPC**: Electron IPC for main/renderer communication

## Requirements

- Windows 10/11
- Administrator privileges
- Discord installed (Stable/Canary/PTB)
- Node.js 16+ (for building)

---

**Made with ❤️ for low-end PC users**
