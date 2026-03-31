# 📦 Manual Packaging Guide - Savecord

## Проблема: electron-builder установка занимает много времени

Если `npm install electron-builder` зависает или занимает слишком много времени, используйте альтернативные методы.

---

## Метод 1: Установка через npx (Рекомендуется)

```bash
# Билд проекта
npm run build

# Упаковка через npx (без установки)
npx electron-builder --win --x64
```

**Преимущества:**
- Не нужно устанавливать electron-builder локально
- npx скачает и запустит последнюю версию
- Экономит место на диске

---

## Метод 2: Глобальная установка

```bash
# Установить electron-builder глобально
npm install -g electron-builder

# Билд проекта
npm run build

# Упаковка
electron-builder --win --x64
```

---

## Метод 3: Использование yarn (Быстрее npm)

```bash
# Установить yarn (если еще не установлен)
npm install -g yarn

# Установить зависимости через yarn
yarn install

# Билд
yarn build

# Упаковка
yarn dist:win
```

---

## Метод 4: Ручная упаковка без electron-builder

Если electron-builder не работает, можно упаковать вручную:

### Шаг 1: Скачать Electron

```bash
# Скачать Electron для Windows x64
npm install electron --save-dev
```

### Шаг 2: Создать структуру приложения

```bash
# Создать папку для упаковки
mkdir -p package/resources/app

# Скопировать файлы
cp -r dist package/resources/app/
cp -r config package/resources/app/
cp package.json package/resources/app/
```

### Шаг 3: Создать исполняемый файл

```bash
# Скопировать electron.exe
cp node_modules/electron/dist/electron.exe package/Savecord.exe

# Создать asar архив
npx asar pack package/resources/app package/resources/app.asar
rm -rf package/resources/app
```

---

## Метод 5: Использование pkg (Альтернатива)

```bash
# Установить pkg
npm install -g pkg

# Упаковать
pkg dist/loader.js --targets node18-win-x64 --output build/Savecord.exe
```

---

## Текущий статус установки

Если установка electron-builder все еще идет:

```bash
# Проверить процесс npm
ps aux | grep npm

# Остановить установку (если нужно)
# Ctrl+C в терминале

# Очистить кэш npm
npm cache clean --force

# Попробовать снова
npm install electron-builder --save-dev --verbose
```

---

## Рекомендуемый workflow (Без ожидания установки)

```bash
# 1. Билд проекта
npm run build

# 2. Упаковка через npx (без установки)
npx electron-builder --win --x64 --config.compression=maximum --config.asar=true

# 3. Результат будет в папке build/
ls build/
```

---

## Конфигурация для npx

Создайте файл `electron-builder.json`:

```json
{
  "appId": "com.savecord.app",
  "productName": "Savecord",
  "copyright": "Copyright © 2024 dorksuser",
  "compression": "maximum",
  "asar": true,
  "directories": {
    "output": "build",
    "buildResources": "resources"
  },
  "files": [
    "dist/**/*",
    "config/**/*",
    "package.json"
  ],
  "win": {
    "target": [
      {
        "target": "nsis",
        "arch": ["x64"]
      }
    ],
    "artifactName": "${productName}-${version}-Setup.${ext}"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "shortcutName": "Savecord"
  }
}
```

Затем запустите:

```bash
npx electron-builder --config electron-builder.json
```

---

## Troubleshooting

### Ошибка: "electron-builder не является командой"

**Решение:**
```bash
# Использовать npx
npx electron-builder --version

# Или установить глобально
npm install -g electron-builder
```

### Ошибка: "Cannot find module 'electron'"

**Решение:**
```bash
# Установить electron
npm install electron --save-dev
```

### Ошибка: Медленная установка

**Решение:**
```bash
# Использовать другой registry
npm config set registry https://registry.npmmirror.com

# Или использовать yarn
npm install -g yarn
yarn install
```

### Ошибка: Недостаточно места на диске

**Решение:**
```bash
# Очистить кэш npm
npm cache clean --force

# Удалить node_modules и переустановить
rm -rf node_modules
npm install
```

---

## Быстрый старт (Без ожидания)

```bash
# 1. Билд
npm run build

# 2. Упаковка через npx
npx electron-builder --win --x64

# 3. Проверить результат
ls build/
```

**Ожидаемый результат:**
```
build/
└── Savecord-1.0.0-Setup.exe
```

---

## Альтернатива: Portable версия (Без установщика)

Если нужна portable версия без установщика:

```bash
# Упаковать как portable
npx electron-builder --win --x64 --config.win.target=portable

# Результат
build/Savecord-1.0.0-Portable.exe
```

---

## Проверка упакованного приложения

```bash
# Запустить установщик
./build/Savecord-1.0.0-Setup.exe

# Или portable версию
./build/Savecord-1.0.0-Portable.exe
```

---

## Размер финального .exe

**Ожидаемые размеры:**
- NSIS Installer: ~50-80 MB
- Portable: ~60-90 MB
- Распакованное приложение: ~100-150 MB

---

## Оптимизация размера

Если .exe слишком большой:

```bash
# Использовать максимальное сжатие
npx electron-builder --win --x64 --config.compression=maximum

# Исключить ненужные файлы
# Добавить в package.json:
"files": [
  "dist/**/*",
  "config/**/*",
  "!**/*.map",
  "!**/*.ts"
]
```

---

**Рекомендация:** Используйте `npx electron-builder` для упаковки без ожидания установки!

**Made with ❤️ for low-end PC users**
