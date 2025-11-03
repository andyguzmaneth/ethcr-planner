import { en } from "./locales/en";
import { es } from "./locales/es";
import { ko } from "./locales/ko";

export type SupportedLocale = "en" | "es" | "ko";

export type TranslationKey = string;

// Type-safe translation object structure (values can differ between languages)
export type Translations = {
  readonly nav: {
    readonly dashboard: string;
    readonly events: string;
    readonly tracks: string;
    readonly tasks: string;
    readonly meetings: string;
    readonly settings: string;
  };
  readonly header: {
    readonly search: string;
    readonly notifications: string;
    readonly userMenu: string;
    readonly toggleMenu: string;
  };
  readonly dashboard: {
    readonly title: string;
    readonly welcome: string;
    readonly myTasks: string;
    readonly activeTasks: string;
    readonly overdue: string;
    readonly overdueTasks: string;
    readonly completedToday: string;
    readonly completedTodayDesc: string;
    readonly upcomingDeadlines: string;
    readonly upcomingDeadlinesDesc: string;
    readonly recentActivity: string;
    readonly recentActivityDesc: string;
    readonly myTracks: string;
    readonly myTracksDesc: string;
    readonly taskCompleted: string;
    readonly taskCompletedBy: string;
    readonly unknownUser: string;
  };
  readonly time: {
    readonly lessThanMinute: string;
    readonly minutesAgo: string;
    readonly hoursAgo: string;
    readonly daysAgo: string;
  };
  readonly events: {
    readonly title: string;
    readonly description: string;
    readonly newEvent: string;
    readonly noEvents: string;
    readonly createFirstEvent: string;
    readonly tracks: string;
    readonly tasks: string;
    readonly progress: string;
    readonly joined: string;
    readonly join: string;
    readonly joining: string;
    readonly leaving: string;
  };
  readonly eventDetail: {
    readonly notFound: string;
    readonly eventPlanningPanel: string;
    readonly editEvent: string;
    readonly overview: string;
    readonly totalTracks: string;
    readonly totalTasks: string;
    readonly completion: string;
    readonly addTrack: string;
    readonly addTask: string;
    readonly scheduleMeeting: string;
    readonly tasksListDescription: string;
    readonly meetingsListDescription: string;
    readonly leader: string;
    readonly unassigned: string;
  };
  readonly newEventModal: {
    readonly title: string;
    readonly description: string;
    readonly meetupTemplate: string;
    readonly meetupDescription: string;
    readonly ethPuraVidaTemplate: string;
    readonly ethPuraVidaDescription: string;
    readonly cancel: string;
    readonly continue: string;
  };
  readonly common: {
    readonly loading: string;
    readonly save: string;
    readonly cancel: string;
    readonly delete: string;
    readonly edit: string;
    readonly close: string;
    readonly back: string;
    readonly next: string;
    readonly previous: string;
    readonly submit: string;
    readonly confirm: string;
    readonly yes: string;
    readonly no: string;
  };
};

export const translations: Record<SupportedLocale, Translations> = {
  en,
  es,
  ko,
};

// Default language (can be overridden via environment variable or user preference)
const DEFAULT_LOCALE: SupportedLocale = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as SupportedLocale) || "es";

/**
 * Get the current locale from environment variable or default
 * In a real app, this would come from user preferences, cookies, or URL params
 */
export function getLocale(): SupportedLocale {
  if (typeof window !== "undefined") {
    // Client-side: check localStorage or other user preference
    const stored = localStorage.getItem("app_locale") as SupportedLocale | null;
    if (stored && (stored === "en" || stored === "es" || stored === "ko")) {
      return stored;
    }
  }
  return DEFAULT_LOCALE;
}

/**
 * Set the locale preference
 */
export function setLocale(locale: SupportedLocale): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("app_locale", locale);
  }
}

/**
 * Get translations for a specific locale
 */
export function getTranslations(locale?: SupportedLocale): Translations {
  const targetLocale = locale || getLocale();
  return translations[targetLocale] || translations[DEFAULT_LOCALE];
}

/**
 * Type-safe helper to get nested translation values
 * Usage: t("nav.dashboard") => "Dashboard" or "Panel" depending on locale
 */
export function createTranslationFunction(locale?: SupportedLocale) {
  const t = (key: string, params?: Record<string, string | number>): string => {
    const translations = getTranslations(locale);
    const keys = key.split(".");
    let value: unknown = translations;

    for (const k of keys) {
      if (typeof value === "object" && value !== null && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    if (typeof value !== "string") {
      console.warn(`Translation value is not a string for key: ${key}`);
      return key;
    }

    // Simple parameter substitution for pluralization
    // Format: "{count} {count, plural, one {item} other {items}}"
    if (params) {
      let result = value;
      for (const [paramKey, paramValue] of Object.entries(params)) {
        const regex = new RegExp(`\\{${paramKey}\\}`, "g");
        result = result.replace(regex, String(paramValue));

        // Handle pluralization (basic implementation)
        const pluralRegex = new RegExp(
          `\\{${paramKey},\\s*plural,\\s*one\\s*\\{([^}]+)\\}\\s*other\\s*\\{([^}]+)\\}\\}`,
          "g"
        );
        result = result.replace(pluralRegex, (_, one, other) => {
          return paramValue === 1 ? one : other;
        });
      }
      return result;
    }

    return value;
  };

  return t;
}

/**
 * Server-side translation function (doesn't use localStorage)
 */
export function getServerTranslations(locale?: SupportedLocale): Translations {
  const targetLocale = locale || (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as SupportedLocale) || DEFAULT_LOCALE;
  return translations[targetLocale] || translations[DEFAULT_LOCALE];
}

/**
 * Create server-side translation function
 */
export function createServerTranslationFunction(locale?: SupportedLocale) {
  const translations = getServerTranslations(locale);
  
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: unknown = translations;

    for (const k of keys) {
      if (typeof value === "object" && value !== null && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    if (typeof value !== "string") {
      console.warn(`Translation value is not a string for key: ${key}`);
      return key;
    }

    // Simple parameter substitution
    if (params) {
      let result = value;
      for (const [paramKey, paramValue] of Object.entries(params)) {
        const regex = new RegExp(`\\{${paramKey}\\}`, "g");
        result = result.replace(regex, String(paramValue));

        // Handle pluralization
        const pluralRegex = new RegExp(
          `\\{${paramKey},\\s*plural,\\s*one\\s*\\{([^}]+)\\}\\s*other\\s*\\{([^}]+)\\}\\}`,
          "g"
        );
        result = result.replace(pluralRegex, (_, one, other) => {
          return paramValue === 1 ? one : other;
        });
      }
      return result;
    }

    return value;
  };

  return t;
}

