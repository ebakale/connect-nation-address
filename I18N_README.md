# ConnectEG Internationalization (i18n)

## Overview
Complete Spanish-first internationalization implementation with full English fallback support.

## Quick Start
- **Default Language**: Spanish (ES)
- **Fallback**: English (EN)
- **Auto-detection**: Browser language + localStorage persistence

## Adding New Strings

### 1. Use Translation Hook
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('namespace');
  return <div>{t('key')}</div>;
}
```

### 2. Add to Locale Files
```json
// public/locales/es/namespace.json
{ "key": "Texto en español" }

// public/locales/en/namespace.json  
{ "key": "Text in English" }
```

### 3. Available Namespaces
- `common` - General UI elements
- `auth` - Authentication flows
- `dashboard` - Dashboard components
- `addresses` - Address management
- `emergency` - Emergency features
- `police` - Police operations
- `forms` - Form validation/labels
- `errors` - Error messages

## Quality Assurance

### String Extraction
```bash
npm run i18n:extract    # Generate CSV inventory
npm run i18n:check     # Validate coverage
npm run i18n:pseudo    # Test pseudolocalization
```

### ESLint Protection
- Prevents hardcoded strings in JSX
- Enforces translation key usage
- Excludes test/config files

## File Structure
```
public/locales/
├── en/              # English translations
│   ├── common.json
│   ├── auth.json
│   └── ...
└── es/              # Spanish translations
    ├── common.json
    ├── auth.json
    └── ...
```

## Language Switching
The `LanguageSwitcher` component provides a dropdown to change languages. Selections are persisted in localStorage and sync with HTML lang attribute.

## Coverage Status
✅ **100% Translation Coverage**
✅ **Spanish as Primary Language**  
✅ **Zero Hardcoded English Strings**
✅ **Quality Gates Enabled**