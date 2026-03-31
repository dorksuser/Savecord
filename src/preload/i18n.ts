import { Webpack } from "../webpack";
import { Patcher } from "../webpack/patcher";

type Locale = "en-US" | "ru";

interface Translations {
  [key: string]: {
    "en-US": string;
    "ru": string;
  };
}

const translations: Translations = Object.freeze({
  // Quick Bar tooltips
  "quickbar.optimize": {
    "en-US": "Master Optimization",
    "ru": "Мастер оптимизация"
  },
  "quickbar.nuclear": {
    "en-US": "Nuclear Mode",
    "ru": "Ядерный режим"
  },
  "quickbar.zapret": {
    "en-US": "Refresh Zapret",
    "ru": "Обновить Zapret"
  },
  "quickbar.ghost": {
    "en-US": "Ghost Mode",
    "ru": "Режим невидимки"
  },
  "quickbar.radio": {
    "en-US": "Radio Mode",
    "ru": "Радио режим"
  },
  
  // Status messages
  "status.testing": {
    "en-US": "Testing Network...",
    "ru": "Тестирование сети..."
  },
  "status.fixed": {
    "en-US": "Connection Fixed",
    "ru": "Соединение исправлено"
  },
  "status.update_found": {
    "en-US": "Update Found",
    "ru": "Найдено обновление"
  },
  
  // Media Killswitch
  "media.blocked": {
    "en-US": "Media Killswitch Active - Click to View",
    "ru": "Блокировка медиа активна - Нажмите для просмотра"
  },
  
  // Settings labels
  "settings.nuclear_mode": {
    "en-US": "Nuclear Mode Settings",
    "ru": "Настройки ядерного режима"
  },
  "settings.ghost_mode": {
    "en-US": "Ghost Mode Settings",
    "ru": "Настройки режима невидимки"
  },
  "settings.radio_mode": {
    "en-US": "Radio Mode Settings",
    "ru": "Настройки радио режима"
  },
  "settings.enable": {
    "en-US": "Enable",
    "ru": "Включить"
  },
  "settings.disable": {
    "en-US": "Disable",
    "ru": "Отключить"
  },
  
  // Plugin descriptions
  "plugin.nuclear.desc": {
    "en-US": "Extreme performance optimization with media blocking",
    "ru": "Экстремальная оптимизация производительности с блокировкой медиа"
  },
  "plugin.ghost.desc": {
    "en-US": "Privacy features: typing stealth and read stealth",
    "ru": "Функции приватности: скрытие печати и прочтения"
  },
  "plugin.radio.desc": {
    "en-US": "Audio-only mode for maximum performance during gaming",
    "ru": "Аудио-режим для максимальной производительности во время игры"
  }
});

class I18nManager {
  private currentLocale: Locale = "en-US";
  private listeners: Array<() => void> = [];
  
  constructor() {
    this.detectLocale();
    this.hookLocaleChanges();
  }
  
  private detectLocale() {
    // Try to get locale from Discord's LocaleStore
    const LocaleStore = Webpack.findByProps("getLocale");
    if (LocaleStore?.getLocale) {
      const locale = LocaleStore.getLocale();
      this.currentLocale = locale === "ru" ? "ru" : "en-US";
      return;
    }
    
    // Fallback to HTML lang attribute
    const htmlLang = document.documentElement.lang;
    if (htmlLang?.startsWith("ru")) {
      this.currentLocale = "ru";
    }
  }
  
  private hookLocaleChanges() {
    const Dispatcher = Webpack.findByProps("dispatch", "subscribe");
    if (!Dispatcher) return;
    
    Patcher.before(Dispatcher, "dispatch", (args) => {
      const [event] = args;
      if (event.type === "LOCALE_SETTINGS_UPDATE") {
        const newLocale = event.locale === "ru" ? "ru" : "en-US";
        if (newLocale !== this.currentLocale) {
          this.currentLocale = newLocale;
          this.notifyListeners();
        }
      }
    });
  }
  
  private notifyListeners() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        // Silent fail
      }
    }
  }
  
  t(key: string): string {
    const translation = translations[key];
    if (!translation) {
      return key; // Return key if translation not found
    }
    
    return translation[this.currentLocale] || translation["en-US"] || key;
  }
  
  onLocaleChange(callback: () => void) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  getCurrentLocale(): Locale {
    return this.currentLocale;
  }
}

// Global instance
const i18n = new I18nManager();

// Export helper function
export function t(key: string): string {
  return i18n.t(key);
}

export function onLocaleChange(callback: () => void): () => void {
  return i18n.onLocaleChange(callback);
}

export function getCurrentLocale(): Locale {
  return i18n.getCurrentLocale();
}

// Make available globally
(window as any).SavecordI18n = { t, onLocaleChange, getCurrentLocale };