# Internationalization (i18n) System

This directory contains the internationalization system for the ETHCR Planner application. The system supports multiple languages (English, Spanish) and makes it easy to add new languages or update translations.

## Structure

- `locales/` - Translation files for each supported language
  - `en.ts` - English translations
  - `es.ts` - Spanish translations
- `index.ts` - Core translation utilities and functions
- `useTranslation.tsx` - React hook and context provider for client-side translations

## Usage

### In Client Components

Use the `useTranslation` hook:

```tsx
"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";

export function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t("nav.dashboard")}</h1>
      <p>{t("dashboard.welcome")}</p>
      {/* With parameters */}
      <p>{t("time.minutesAgo", { count: 5 })}</p>
    </div>
  );
}
```

### In Server Components

Use the server translation function:

```tsx
import { createServerTranslationFunction } from "@/lib/i18n";

export default function MyServerComponent() {
  const t = createServerTranslationFunction();
  
  return <h1>{t("nav.dashboard")}</h1>;
}
```

### Translation Key Format

Translation keys use dot notation to access nested objects:

- `nav.dashboard` - Accesses the `dashboard` property in the `nav` object
- `dashboard.welcome` - Accesses the `welcome` property in the `dashboard` object

### Parameters and Pluralization

Some translations support parameters for dynamic content:

```tsx
// Translation definition
minutesAgo: "{count} {count, plural, one {minute} other {minutes}} ago"

// Usage
t("time.minutesAgo", { count: 5 })  // "5 minutes ago"
t("time.minutesAgo", { count: 1 })  // "1 minute ago"
```

## Language Configuration

### Default Language

Set the default language using the `NEXT_PUBLIC_DEFAULT_LOCALE` environment variable:

```bash
# .env.local
NEXT_PUBLIC_DEFAULT_LOCALE=es  # Options: en, es
```

### Changing Language

Users can change the language using the language switcher component in the header. The preference is stored in `localStorage` and persists across page reloads.

### Supported Languages

- `en` - English
- `es` - Spanish

## Adding a New Language

1. Create a new translation file in `locales/` (e.g., `fr.ts` for French)
2. Copy the structure from `en.ts` and translate all values
3. Add the new locale to the `SupportedLocale` type in `index.ts`
4. Add the translations to the `translations` object in `index.ts`
5. Add the language name to `languageNames` in `components/ui/language-switcher.tsx`

Example:

```typescript
// lib/i18n/locales/fr.ts
export const fr = {
  nav: {
    dashboard: "Tableau de bord",
    events: "Événements",
    // ... rest of translations
  },
  // ... rest of structure
} as const;
```

```typescript
// lib/i18n/index.ts
export type SupportedLocale = "en" | "es" | "fr";  // Add "fr"

export const translations: Record<SupportedLocale, Translations> = {
  en,
  es,
  fr,  // Add French translations
};
```

## Adding New Translation Keys

1. Add the key to all language files in `locales/`
2. Use the key in your components using dot notation

Example:

```typescript
// lib/i18n/locales/en.ts
export const en = {
  nav: {
    // ... existing keys
    newFeature: "New Feature",  // Add new key
  },
} as const;

// lib/i18n/locales/es.ts
export const es = {
  nav: {
    // ... existing keys
    newFeature: "Nueva Característica",  // Add translation
  },
} as const;

// In component
{t("nav.newFeature")}
```

## Best Practices

1. **Keep keys organized** - Group related translations together (nav, dashboard, events, etc.)
2. **Use descriptive keys** - Keys should clearly indicate what they're for
3. **Translate all strings** - Ensure all user-facing text uses translations
4. **Test all languages** - Verify translations display correctly in all supported languages
5. **Handle missing keys** - The system will log warnings for missing keys and display the key itself as a fallback

## Type Safety

The translation system is fully typed. TypeScript will help you catch:
- Typos in translation keys
- Missing translations
- Incorrect parameter usage

