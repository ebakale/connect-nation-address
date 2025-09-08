# Internationalization (i18n) Documentation

## Overview

This project implements comprehensive internationalization using `i18next` and `react-i18next`, supporting English (en), Spanish (es), and French (fr) languages.

## Architecture

### Technology Stack
- **i18next**: Core internationalization framework
- **react-i18next**: React bindings for i18next
- **i18next-browser-languagedetector**: Automatic language detection

### File Structure
```
src/
├── i18n/
│   └── config.ts                 # i18n configuration
├── locales/
│   ├── en/                       # English translations
│   │   ├── common.json
│   │   ├── auth.json
│   │   ├── dashboard.json
│   │   ├── address.json
│   │   ├── emergency.json
│   │   └── admin.json
│   ├── es/                       # Spanish translations
│   │   └── [same structure]
│   └── fr/                       # French translations
│       └── [same structure]
└── components/
    └── LanguageSwitcher.tsx      # Language selection component
```

## Translation Namespaces

The translations are organized into logical namespaces:

1. **common**: General UI elements, buttons, navigation, status messages
2. **auth**: Authentication forms, validation messages, login/signup
3. **dashboard**: Dashboard components, statistics, overview screens
4. **address**: Address management, registration, verification
5. **emergency**: Emergency services, incident reporting, police functions
6. **admin**: Administrative functions, user management, system settings

## Usage

### In Components

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  // Simple translation
  return <h1>{t('common:navigation.home')}</h1>;
  
  // Translation with interpolation
  return <p>{t('dashboard:welcomeBack', { name: user.name })}</p>;
  
  // Translation with pluralization
  return <span>{t('common:time.minutes', { count: 5 })}</span>;
};
```

### Namespaced Translations

```typescript
// Use specific namespace
const { t } = useTranslation('auth');
const title = t('signIn'); // reads from auth namespace

// Use multiple namespaces
const { t } = useTranslation(['common', 'dashboard']);
const button = t('common:buttons.save');
const title = t('dashboard:overview');
```

## Language Detection & Switching

### Automatic Detection
The system automatically detects language from:
1. localStorage (user's previous selection)
2. Browser Accept-Language header
3. Falls back to English

### Manual Language Switching
Use the `LanguageSwitcher` component or programmatically:

```typescript
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();
i18n.changeLanguage('es'); // Switch to Spanish
```

## Locale-Aware Formatting

### Numbers and Currency
```typescript
// Use Intl for formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency: 'XAF'
  }).format(amount);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat(i18n.language).format(num);
};
```

### Dates and Times
```typescript
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat(i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};
```

## Adding New Translations

### 1. Add Translation Keys

Add the new keys to all language files:

```json
// src/locales/en/common.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "This is a new feature"
  }
}
```

```json
// src/locales/es/common.json
{
  "newFeature": {
    "title": "Nueva Característica",
    "description": "Esta es una nueva característica"
  }
}
```

```json
// src/locales/fr/common.json
{
  "newFeature": {
    "title": "Nouvelle Fonctionnalité",
    "description": "Ceci est une nouvelle fonctionnalité"
  }
}
```

### 2. Use in Components

```typescript
const { t } = useTranslation('common');
return (
  <div>
    <h2>{t('newFeature.title')}</h2>
    <p>{t('newFeature.description')}</p>
  </div>
);
```

## Adding a New Language

### 1. Create Translation Files

Create new language directory:
```
src/locales/pt/  # Portuguese example
├── common.json
├── auth.json
├── dashboard.json
├── address.json
├── emergency.json
└── admin.json
```

### 2. Update i18n Configuration

```typescript
// src/i18n/config.ts
import commonPT from '../locales/pt/common.json';
// ... import other PT files

const resources = {
  en: { /* existing */ },
  es: { /* existing */ },
  fr: { /* existing */ },
  pt: {
    common: commonPT,
    auth: authPT,
    dashboard: dashboardPT,
    address: addressPT,
    emergency: emergencyPT,
    admin: adminPT,
  },
};
```

### 3. Update Language Switcher

```typescript
// src/components/LanguageSwitcher.tsx
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
];
```

## Testing Locales

### 1. Test Translation Keys

```bash
# Check for missing keys
npm run i18n:check-missing

# Validate JSON structure
npm run i18n:validate
```

### 2. Test Formatting

```typescript
// Test different locales
i18n.changeLanguage('es');
console.log(formatCurrency(1000)); // Check currency formatting

i18n.changeLanguage('fr');
console.log(formatDate(new Date())); // Check date formatting
```

### 3. Test Pluralization

```typescript
// Test plural forms
console.log(t('common:time.minutes', { count: 0 })); // 0 minutes
console.log(t('common:time.minutes', { count: 1 })); // 1 minute
console.log(t('common:time.minutes', { count: 5 })); // 5 minutes
```

## Best Practices

### 1. Key Naming Convention
- Use nested objects for organization
- Use camelCase for keys
- Be descriptive but concise
- Group related translations

```json
{
  "user": {
    "profile": {
      "edit": "Edit Profile",
      "save": "Save Changes",
      "cancel": "Cancel"
    }
  }
}
```

### 2. Interpolation

```json
{
  "welcome": "Welcome back, {{name}}!",
  "itemCount": "You have {{count}} item",
  "itemCount_plural": "You have {{count}} items"
}
```

### 3. Context and Comments

```json
{
  "button": {
    "save": "Save",
    "_comment": "Used in forms throughout the application"
  }
}
```

### 4. Avoid Hardcoded Strings

❌ Bad:
```typescript
<button>Save</button>
```

✅ Good:
```typescript
<button>{t('common:buttons.save')}</button>
```

## Fallback Strategy

The system uses a fallback chain:
1. User's selected language
2. English (en) as fallback
3. Key itself if translation missing

## Performance Considerations

- Translations are loaded on demand by namespace
- Use `react.useSuspense: false` to avoid loading states
- Consider lazy loading for large translation files

## Troubleshooting

### Missing Translation Warning

If you see console warnings about missing keys:

```
Warning: Missing translation key: es:dashboard:newFeature
```

1. Check if the key exists in the target language file
2. Verify the namespace is loaded
3. Check for typos in the key path

### Language Not Switching

1. Verify the language code is correct
2. Check browser localStorage for cached language
3. Ensure language files are properly imported

### Formatting Issues

1. Check browser support for Intl APIs
2. Verify locale codes are valid
3. Test with different number/date formats

## Migration from Legacy System

The project previously used a custom `LanguageContext`. The migration:

1. ✅ Installed i18next packages
2. ✅ Created translation files
3. ✅ Set up configuration
4. ✅ Added language switcher
5. 🔄 Converting components (in progress)
6. ⏳ Remove legacy context (after conversion complete)

## Support

For issues or questions about i18n implementation:
1. Check this documentation
2. Review the i18next documentation
3. Check browser console for warnings
4. Test in different browsers/locales