# ⚡ Quick Package Guide - Savecord

## Самый быстрый способ упаковать Savecord в .exe

---

## Шаг 1: Билд проекта

```bash
npm run build
```

**Результат:**
```
dist\injector.js  838 bytes
dist\loader.js    40.5 KB
dist\preload.js   72.4 KB
```

---

## Шаг 2: Упаковка через npx (БЕЗ установки electron-builder)

```bash
npx electron-builder --win --x64
```

**Что происходит:**
1. npx скачает electron-builder (если еще не скачан)
2. Упакует приложение согласно конфигурации в package.json
3. Создаст NSIS установщик в папке `build/`

**Ожидаемый результат:**
```
build/
└── Savecord-1.0.0-Setup.exe
```

---

## Альтернатива: Portable версия

Если нужна portable версия (без установщика):

```bash
npx electron-builder --win --x64 portable
```

**Результат:**
```
build/
└── Savecord-1.0.0-Portable.exe
```

---

## Полная команда с опциями

```bash
npx electron-builder \
  --win \
  --x64 \
  --config.compression=maximum \
  --config.asar=true \
  --config.productName=Savecord \
  --config.appId=com.savecord.app
```

---

## Если npx не работает

### Вариант 1: Глобальная установка

```bash
npm install -g electron-builder
electron-builder --win --x64
```

### Вариант 2: Через yarn

```bash
npm install -g yarn
yarn install
yarn dist:win
```

---

## Проверка результата

```bash
# Проверить, что файл создан
ls build/

# Проверить размер
du -h build/Savecord-1.0.0-Setup.exe

# Запустить установщик
./build/Savecord-1.0.0-Setup.exe
```

---

## Ожидаемые размеры

| Тип | Размер |
|-----|--------|
| NSIS Installer | 50-80 MB |
| Portable | 60-90 MB |
| Установленное приложение | 100-150 MB |

---

## Troubleshooting

### "npx: command not found"

```bash
# Обновить npm
npm install -g npm@latest

# Проверить npx
npx --version
```

### "Cannot find module 'electron'"

```bash
# Установить electron
npm install electron --save-dev
```

### Упаковка зависает

```bash
# Остановить (Ctrl+C)
# Очистить кэш
npm cache clean --force

# Попробовать снова
npx electron-builder --win --x64
```

---

## Итоговая команда (Копируй и вставляй)

```bash
# Билд + Упаковка одной командой
npm run build && npx electron-builder --win --x64
```

**Время выполнения:** ~2-5 минут (в зависимости от скорости интернета)

---

**Made with ❤️ for low-end PC users**
