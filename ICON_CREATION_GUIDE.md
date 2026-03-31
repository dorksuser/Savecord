# 🎨 Icon Creation Guide - Savecord

## Проблема решена!

electron-builder теперь использует иконку Electron по умолчанию. Упаковка должна пройти успешно.

---

## Как добавить кастомную иконку (Опционально)

### Шаг 1: Создать иконку

**Онлайн генераторы:**
- https://www.favicon-generator.org/
- https://www.icoconverter.com/
- https://convertio.co/png-ico/

**Требования:**
- Формат: .ico
- Размер: 256x256 пикселей
- Прозрачный фон (опционально)

---

### Шаг 2: Noir Style Design

**Цветовая схема Savecord:**
- Фон: Черный (#000000)
- Акцент: Неоновый циан (#3CAEA3)
- Текст: Белый (#FFFFFF)

**Идеи для иконки:**
1. Щит с буквой "S"
2. Замок с неоновым свечением
3. Минималистичный Discord логотип в Noir стиле
4. Абстрактная геометрия (треугольники, шестиугольники)

---

### Шаг 3: Создать иконку с помощью AI

**Prompt для DALL-E / Midjourney:**
```
Create a minimalist app icon for "Savecord", a Discord security mod.
Style: Noir/cyberpunk, black background, neon cyan (#3CAEA3) accents.
Elements: Shield or lock symbol, geometric shapes, clean lines.
Size: 256x256px, transparent background.
```

---

### Шаг 4: Конвертировать в .ico

1. Сохранить PNG (256x256)
2. Перейти на https://convertio.co/png-ico/
3. Загрузить PNG
4. Скачать .ico
5. Сохранить как `resources/icon.ico`

---

### Шаг 5: Обновить package.json

```json
{
  "build": {
    "win": {
      "icon": "resources/icon.ico"
    },
    "nsis": {
      "installerIcon": "resources/icon.ico",
      "uninstallerIcon": "resources/icon.ico"
    }
  }
}
```

---

### Шаг 6: Пересобрать

```bash
npm run dist:win
```

---

## Быстрое решение: Использовать готовую иконку

### Вариант 1: Electron Default Icon
Уже используется! Ничего делать не нужно.

### Вариант 2: Скачать готовую иконку

**Бесплатные иконки:**
- https://www.flaticon.com/ (поиск: "shield", "lock", "security")
- https://icons8.com/ (поиск: "cybersecurity")
- https://www.iconfinder.com/ (поиск: "noir shield")

**Лицензия:** Проверьте, что иконка бесплатна для коммерческого использования!

---

## Создание иконки в GIMP (Бесплатно)

### Шаг 1: Установить GIMP
https://www.gimp.org/downloads/

### Шаг 2: Создать новое изображение
- File → New
- Width: 256px
- Height: 256px
- Fill with: Transparency

### Шаг 3: Нарисовать иконку
1. Выбрать черный фон (Bucket Fill Tool)
2. Добавить щит или замок (Shapes)
3. Применить неоновый эффект:
   - Filters → Light and Shadow → Glow
   - Color: #3CAEA3

### Шаг 4: Экспортировать
- File → Export As
- Сохранить как PNG (256x256)

### Шаг 5: Конвертировать в .ico
Использовать онлайн конвертер (см. выше)

---

## Создание иконки в Photoshop

### Шаг 1: Новый документ
- 256x256px
- Прозрачный фон

### Шаг 2: Дизайн
1. Черный фон (если нужен)
2. Добавить форму (щит, замок)
3. Применить Outer Glow:
   - Color: #3CAEA3
   - Size: 10-20px
   - Opacity: 80%

### Шаг 3: Сохранить
- File → Save As → PNG
- Конвертировать в .ico

---

## Простая текстовая иконка

Если нужна быстрая иконка:

### Шаг 1: Создать в Paint
1. Открыть Paint
2. Создать 256x256 изображение
3. Залить черным
4. Написать большую букву "S" белым цветом
5. Сохранить как PNG

### Шаг 2: Конвертировать
Использовать онлайн конвертер

---

## Проверка иконки

```bash
# Пересобрать с новой иконкой
npm run dist:win

# Проверить результат
ls build/

# Запустить установщик
./build/Savecord-1.0.0-Setup.exe
```

---

## Текущий статус

✅ **Упаковка работает БЕЗ кастомной иконки**

Используется иконка Electron по умолчанию. Это нормально для первого релиза!

Кастомную иконку можно добавить позже в обновлении (v1.0.1).

---

## Рекомендация

Для первого релиза:
- ✅ Использовать иконку по умолчанию
- ✅ Сосредоточиться на функциональности
- ✅ Добавить кастомную иконку в v1.1.0

---

**Made with ❤️ for low-end PC users**
