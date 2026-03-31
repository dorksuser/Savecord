# Onion-Style Privacy для Savecord

## Обзор

Система Onion Privacy обеспечивает многоуровневую защиту приватности для пользователей Savecord на слабом железе (Pentium G850 / HD 6670).

## Компоненты

### 1. Telemetry Blackhole (Main Process)

Блокирует все запросы к телеметрии и аналитике на уровне сети:

- `/science` - Discord Science API
- `/analytics` - Аналитика
- `/metrics` - Метрики
- `/track` - Трекинг
- `sentry.io` - Отчеты об ошибках
- `google-analytics.com` - Google Analytics
- `doubleclick.net` - Реклама
- `facebook.com/tr` - Facebook Pixel
- `hotjar.com` - Hotjar
- `mixpanel.com` - Mixpanel

**Производительность**: Использует простое сравнение строк для минимальной нагрузки на CPU.

### 2. Fingerprint Spoofer (Renderer Process)

Подменяет цифровые отпечатки браузера:

- `navigator.languages` → `['en-US', 'en']`
- `navigator.plugins` → `[]` (пустой массив)
- `navigator.webdriver` → `false`
- `screen.width/height` → `1920x1080` (стандартное разрешение)
- `window.innerWidth/innerHeight` → `1920x1040`
- Canvas fingerprinting → добавляет шум через XOR
- WebGL fingerprinting → возвращает общие значения

### 3. Proxy Manager (Main Process)

Поддержка маршрутизации через прокси:

- **Tor**: `socks5://127.0.0.1:9050` (Tor Browser Bundle)
- **Custom SOCKS5**: Любой SOCKS5 прокси
- **Bypass**: `localhost, 127.0.0.1` автоматически исключены

### 4. Metadata Sanitizer (Preload Process)

Удаляет метаданные из загружаемых файлов:

- **JPEG**: Удаляет EXIF данные (APP1 маркеры)
- **PNG**: Удаляет tEXt, zTXt, iTXt, tIME, pHYs, iCCP, sRGB, gAMA, cHRM чанки
- **Timestamp**: Заменяет оригинальное время на текущее

## Конфигурация

### Файл: `config/privacy.json`

```json
{
  "blockTelemetry": true,
  "spoofFingerprint": true,
  "useProxy": false,
  "proxyAddress": "socks5://127.0.0.1:9050",
  "sanitizeMetadata": true
}
```

### Настройки в UI

Откройте настройки плагина "Onion Privacy" в Savecord:

1. **Включить Onion Privacy** - Главный переключатель
2. **Подмена цифровых отпечатков** - Fingerprint spoofing
3. **Очистка EXIF/метаданных** - Metadata sanitization

## Использование с Tor

### Шаг 1: Установка Tor Browser Bundle

1. Скачайте [Tor Browser](https://www.torproject.org/download/)
2. Установите и запустите Tor Browser
3. Tor автоматически запустит SOCKS5 прокси на `127.0.0.1:9050`

### Шаг 2: Включение прокси в Savecord

Отредактируйте `config/privacy.json`:

```json
{
  "useProxy": true,
  "proxyAddress": "socks5://127.0.0.1:9050"
}
```

### Шаг 3: Перезапуск Discord

Перезапустите Discord для применения настроек.

## Производительность

### Оптимизации для Pentium G850:

- **Telemetry Blocking**: O(n) простое сравнение строк, ~0.1ms на запрос
- **Fingerprint Spoofing**: Выполняется один раз при загрузке страницы
- **EXIF Stripping**: Обрабатывается только при загрузке файлов
- **Proxy**: Нативная поддержка Electron, без дополнительной нагрузки

### Потребление памяти:

- Privacy Manager: ~2MB
- Fingerprint Spoof Script: ~1KB
- EXIF Stripper: ~5KB на файл

## Безопасность

### Что защищено:

✅ Блокировка телеметрии Discord  
✅ Защита от canvas fingerprinting  
✅ Защита от WebGL fingerprinting  
✅ Удаление GPS координат из фото  
✅ Удаление информации о камере  
✅ Стандартизация разрешения экрана  

### Что НЕ защищено:

❌ IP адрес (используйте Tor/VPN)  
❌ Время активности (behavioral fingerprinting)  
❌ Стиль печати (typing patterns)  
❌ Содержимое сообщений (используйте E2EE)  

## Troubleshooting

### Проблема: Discord не загружается с прокси

**Решение**: Проверьте, что Tor Browser запущен и прокси доступен:

```bash
curl --socks5 127.0.0.1:9050 https://check.torproject.org
```

### Проблема: Изображения не загружаются

**Решение**: Отключите `sanitizeMetadata` в настройках плагина.

### Проблема: Высокая нагрузка на CPU

**Решение**: Убедитесь, что `blockTelemetry` использует простое сравнение строк (не regex).

## Дополнительные рекомендации

1. **Используйте VPN** в дополнение к Tor для максимальной анонимности
2. **Отключите WebRTC** в настройках Discord (Settings → Voice & Video → Disable WebRTC)
3. **Используйте временные аккаунты** для максимальной приватности
4. **Не загружайте личные фото** даже с удаленными EXIF данными

## Лицензия

MIT License - используйте на свой риск.
