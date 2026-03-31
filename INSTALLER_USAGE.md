# Savecord Installer Usage Guide

## Quick Start

### Building the Installer

```bash
# 1. Build main Savecord files
npm run build

# 2. Build installer
npm run build-installer

# 3. Package installer (creates .exe)
npm run dist:installer
```

Output: `build/installer/Savecord Installer-1.0.0-Setup.exe`

### Using the Installer

1. Run `Savecord Installer-1.0.0-Setup.exe` as Administrator
2. The Noir-style UI will appear (600x400 black window)
3. Installer automatically scans for Discord installations
4. Click "Initialize Savecord" to inject
5. Wait for success message
6. Click "Launch Discord" to start Discord with Savecord

### Uninstalling

1. Run the installer again
2. Click "Restore Original"
3. Original Discord files will be restored from backup

## Features

- Automatic Discord detection (Stable/Canary/PTB)
- Safe injection with automatic backup
- Real-time console logging
- Rollback on failure
- Admin rights enforcement

## Troubleshooting

**No Discord found**: Install Discord first
**Injection failed**: Run as Administrator
**Already injected**: Use "Restore Original" first

---

Made with ❤️ for low-end PC users
