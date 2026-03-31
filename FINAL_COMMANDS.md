# 🚀 Savecord v1.0.0 - Final Commands

## ✅ Проект готов к релизу!

---

## 📦 Упаковка в .exe (Выберите один метод)

### Метод 1: Через npx (Рекомендуется - БЕЗ установки)

```bash
# Билд + Упаковка одной командой
npm run build && npx electron-builder --win --x64
```

**Результат:** `build/Savecord-1.0.0-Setup.exe`

---

### Метод 2: Через npm (Если electron-builder установлен)

```bash
# Билд + Упаковка
npm run dist:win
```

---

### Метод 3: Глобальная установка

```bash
# Установить electron-builder глобально
npm install -g electron-builder

# Билд
npm run build

# Упаковка
electron-builder --win --x64
```

---

## 🔧 Git & GitHub Commands

### Инициализация репозитория

```bash
# Инициализировать Git
git init

# Добавить remote
git remote add origin https://github.com/dorksuser/Savecord.git

# Проверить remote
git remote -v
```

---

### Коммит и Push

```bash
# Добавить все файлы
git add .

# Проверить, что будет закоммичено
git status

# ВАЖНО: Убедитесь, что НЕ видите:
# - .env (только .env.example)
# - node_modules/
# - dist/
# - build/
# - .kiro/

# Создать коммит
git commit -m "🎉 Initial release: Savecord v1.0.0

Features:
- Security Shield v2.0 (VirusTotal, token protection, anti-RAT)
- Onion Privacy (telemetry blocking, fingerprint spoofing)
- Ghost Mode & Ghost Archive
- Radio Mode & Nuclear UI
- SoundCloud Controller & RPC
- Zapret DPI Bypass with auto-updater
- Quick Access Bar with i18n (RU/EN)
- Performance optimizations for Intel G850 / AMD HD 6670

Tech Stack:
- TypeScript + esbuild
- Electron preload architecture
- Vanilla DOM (zero React overhead)
- CSS containment for GPU optimization
- LRU caching and rate limiting"

# Установить main branch
git branch -M main

# Push на GitHub
git push -u origin main
```

---

### Создание Release Tag

```bash
# Создать тег
git tag -a v1.0.0 -m "Release v1.0.0: Initial public release"

# Push тег
git push origin v1.0.0
```

---

## 📤 GitHub Release

### Шаг 1: Перейти на GitHub
```
https://github.com/dorksuser/Savecord/releases/new
```

### Шаг 2: Заполнить форму
- **Tag**: v1.0.0
- **Release title**: Savecord v1.0.0 - Initial Release
- **Description**: (см. ниже)

### Шаг 3: Загрузить файлы
- `build/Savecord-1.0.0-Setup.exe`

### Шаг 4: Опубликовать
- Нажать "Publish release"

---

## 📝 Release Notes (Копировать в GitHub)

```markdown
# Savecord v1.0.0 - Initial Release

## 🎯 Overview
Lightweight Discord modification optimized for low-end hardware (Intel Pentium G850 / AMD HD 6670 / 4GB RAM).

## ✨ Features

### Security & Privacy
- 🛡️ **Security Shield v2.0** - VirusTotal integration, token protection, anti-RAT
- 🧅 **Onion Privacy** - Telemetry blocking, fingerprint spoofing, EXIF stripping
- 👻 **Ghost Mode** - Typing stealth and read receipts blocking
- 🗑️ **Ghost Archive** - Deleted message tracking (last 50 per channel)

### Performance
- ⚡ **Nuclear UI** - True black theme with zero animations
- 📻 **Radio Mode** - Audio-only mode (UI freezer for gaming)
- 🔧 **Quick Access Bar** - One-click toggles (⚡☢️🔄👻📻)

### Network
- 🌐 **Zapret DPI Bypass** - Auto-prober with 3 strategies
- 🔄 **Auto-Updater** - GitHub integration for Zapret updates

### Media
- 🎵 **SoundCloud Controller** - Native controls in Discord UI
- 🎤 **SoundCloud RPC** - Rich presence integration

## 📦 Installation

1. Download `Savecord-1.0.0-Setup.exe`
2. Run the installer
3. Follow the setup wizard
4. Restart Discord

## ⚙️ System Requirements

**Minimum:**
- CPU: Intel Pentium G850 (2 cores @ 2.9 GHz)
- GPU: AMD HD 6670
- RAM: 4GB
- OS: Windows 10/11

## 📚 Documentation

- [README](README.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Security Shield Guide](docs/SECURITY_SHIELD.md)
- [Onion Privacy Guide](docs/ONION_PRIVACY.md)

## ⚠️ Disclaimer

This is a client modification. Use at your own risk. Discord's Terms of Service prohibit client modifications.

## 🙏 Credits

- [Vencord](https://github.com/Vendicated/Vencord) - Plugin system inspiration
- [Zapret](https://github.com/bol-van/zapret) - DPI bypass tool
- [VirusTotal](https://www.virustotal.com/) - Malware scanning API

---

**Made with ❤️ for low-end PC users**
```

---

## 🔍 Pre-Push Checklist

Перед push на GitHub, проверьте:

```bash
# Проверить статус Git
git status

# Должны видеть ТОЛЬКО:
✅ .env.example (НЕ .env)
✅ src/
✅ dist/ (в .gitignore)
✅ docs/
✅ scripts/
✅ config/
✅ package.json
✅ tsconfig.json
✅ README.md
✅ LICENSE
✅ .gitignore

# НЕ должны видеть:
❌ .env
❌ node_modules/
❌ build/
❌ .kiro/
❌ *-REFACTORED.*
```

---

## 📊 Build Verification

```bash
# Проверить билд
npm run build

# Ожидаемый результат:
dist\injector.js  838 bytes
dist\loader.js    40.5 KB
dist\preload.js   72.4 KB

[Build] Complete
[Build] Mode: PRODUCTION
[Build] Tree-shaking: ENABLED
[Build] Console logs: DROPPED
```

---

## 🎯 Quick Start (Копируй и вставляй)

```bash
# 1. Билд проекта
npm run build

# 2. Упаковка в .exe (через npx)
npx electron-builder --win --x64

# 3. Git setup
git init
git remote add origin https://github.com/dorksuser/Savecord.git

# 4. Коммит
git add .
git commit -m "🎉 Initial release: Savecord v1.0.0"

# 5. Push
git branch -M main
git push -u origin main

# 6. Создать тег
git tag -a v1.0.0 -m "Release v1.0.0: Initial public release"
git push origin v1.0.0
```

---

## 📁 Файлы для загрузки на GitHub Release

1. `build/Savecord-1.0.0-Setup.exe` - Основной установщик
2. (Опционально) `build/Savecord-1.0.0-Portable.exe` - Portable версия

---

## 🆘 Troubleshooting

### electron-builder не установлен

```bash
# Использовать npx (без установки)
npx electron-builder --win --x64

# Или установить глобально
npm install -g electron-builder
```

### Git push отклонен

```bash
# Pull с rebase
git pull origin main --rebase

# Push снова
git push -u origin main
```

### Ошибка аутентификации Git

1. Создать Personal Access Token на GitHub
2. Использовать токен как пароль при push

---

## 📚 Дополнительные ресурсы

- `DEPLOYMENT_GUIDE.md` - Полная инструкция по деплою
- `GITHUB_PUSH_COMMANDS.md` - Git команды
- `QUICK_PACKAGE.md` - Быстрая упаковка
- `MANUAL_PACKAGING_GUIDE.md` - Альтернативные методы упаковки
- `FINAL_RELEASE_CHECKLIST.md` - Чеклист перед релизом
- `RELEASE_SUMMARY.md` - Сводка релиза

---

## ✅ Статус

- ✅ Проект собран
- ✅ Все файлы готовы
- ✅ Документация создана
- ✅ .env настроен
- ✅ .gitignore настроен
- ✅ package.json настроен
- ✅ Готов к GitHub push

---

**Следующий шаг:** Выполните команды выше для упаковки и push на GitHub!

**Made with ❤️ for low-end PC users**
