# i18n Implementation Guide

## Overview
This project uses `react-i18next` for internationalization with Spanish as the primary language and English as secondary support.

## File Structure
```
public/locales/
├── en/
│   ├── common.json      # Common UI elements
│   ├── auth.json        # Authentication
│   ├── dashboard.json   # Dashboard content
│   ├── addresses.json   # Address management
│   ├── emergency.json   # Emergency services
│   ├── police.json      # Police operations
│   ├── forms.json       # Form validations
│   └── errors.json      # Error messages
└── es/
    └── [same structure]
```

## Adding New Strings

### 1. Choose the Right Namespace
- `common`: Navigation, buttons, status labels
- `auth`: Login, registration, user account
- `dashboard`: Dashboard-specific content
- `addresses`: Address management features
- `emergency`: Emergency services
- `police`: Police operations
- `forms`: Form labels, validation, placeholders
- `errors`: Error messages, 404 pages

### 2. Add to Both Languages
Always add new keys to both `en/` and `es/` files:

```json
// en/common.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "This is a new feature"
  }
}

// es/common.json  
{
  "newFeature": {
    "title": "Nueva Funcionalidad",
    "description": "Esta es una nueva funcionalidad"
  }
}
```

### 3. Use in Components
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('common');
  
  return (
    <div>
      <h1>{t('newFeature.title')}</h1>
      <p>{t('newFeature.description')}</p>
    </div>
  );
}
```

### 4. Multiple Namespaces
```tsx
const { t } = useTranslation(['common', 'forms']);

// Use with namespace prefix
<span>{t('common:loading')}</span>
<span>{t('forms:validation.required')}</span>
```

## Language Switching
The `LanguageSwitcher` component handles language changes and persists selection in localStorage.

## SEO & HTML Lang
Use the `useSEOLocalization` hook for page-specific SEO:

```tsx
import { useSEOLocalization } from '@/hooks/useSEO';

function HomePage() {
  useSEOLocalization('auth:title', 'auth:subtitle', 'auth');
  
  return <div>...</div>;
}
```

## ESLint Rules
The project includes ESLint rules to prevent hardcoded strings:
- No string literals in JSX (except single chars, numbers)
- No hardcoded strings in components
- Exceptions for import paths and CSS classes

## Testing
Run pseudolocalization test:
```bash
chmod +x scripts/test-pseudo.sh
./scripts/test-pseudo.sh
```

## Best Practices
1. Always use semantic keys (not English text as keys)
2. Keep keys consistent across namespaces
3. Use nested objects for related content
4. Add translations for both languages simultaneously
5. Test with pseudolocalization for missing strings
6. Use ICU MessageFormat for plurals and variables:

```json
{
  "itemCount": "{count, plural, =0 {no items} one {# item} other {# items}}"
}
```

## Development Workflow
1. Identify hardcoded strings
2. Choose appropriate namespace
3. Add keys to both language files
4. Replace hardcoded strings with `t()` calls
5. Test both languages
6. Run pseudolocalization test